import createReport from 'docx-templates';


const saveDataToFile = (data:any, fileName: any, mimeType: any) => {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 1000);
};

const downloadURL = (data:any, fileName:any) => {
    let a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
};

const readFileIntoArrayBuffer = (fd: File): Promise<string | null | ArrayBuffer> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(fd);
    });

enum DateFormat {
    DATE = 1,
    TIME = 2,
    DATE_TIME = 3
}

const FORMATS: Record<number, Intl.DateTimeFormatOptions> = {
    [DateFormat.DATE]: { year: 'numeric', month: '2-digit', day: '2-digit' },
    [DateFormat.TIME]: { hour: '2-digit', minute: '2-digit' },
    [DateFormat.DATE_TIME]: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
}

function formatDate(date: string | Date | null | undefined, locale?: string, format?: DateFormat) {
    if (date !== '') {
        const value = typeof date === 'string' ? new Date(date) : date
        if (value != null) {
        return value.toLocaleString(locale || 'es', FORMATS[format || DateFormat.DATE])
        }
    } else {
        return ''
    }
}

const getImageBase64 = (blob: Blob) => {
    return new Promise<string | ArrayBuffer | null>(resolve => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = function () {
        const result = reader.result as string
        if (reader.result) {
            // delete buffer header (extension and other info)
            const index = result.indexOf(',')

            resolve(result.substring(index + 1))
        }
        }
    })
}

type Media = {
    id: string
    createdAt: Date
    updatedAt: Date
    mediaType: number
    name: string
    mimeType: string
    institutionId: string | null
}

enum MediaType {
    AVATAR = 1,
    SCORE = 2
}

const PUBLIC_MEDIA_TYPES = [MediaType.AVATAR]

function getMediaUrl(media: Media, url: string) {
    if (PUBLIC_MEDIA_TYPES.includes(media.mediaType)) {
        return `${url}/api/assets/media/public/${media.id}/${media.name}`
    }

    return `/api/assets/media/${media.id}/${media.name}`
}

const getMediaImageData = async (media: Media, url: string) => {
    const mediaUrl = getMediaUrl(media, url)
    const response = await fetch(mediaUrl)

    const imageBlob = await response.blob()
    const image = await getImageBase64(imageBlob)

    return image
}

type ImageProperties = {
    width: number
    height: number
    extension: string
    thumbnail?: {
        data: string | ArrayBuffer
        extension: string
    }
    alt?: string
    rotation?: number
    caption?: string
}

enum ServiceType {
    CONCERT = 10,
    REPRESENTATION = 11,
    INSTITUTIONAL_ACT = 12
}

export const PERFORMANCE_TYPES = [ServiceType.CONCERT, ServiceType.REPRESENTATION, ServiceType.INSTITUTIONAL_ACT]

const processTemplate = async (file: File, data: string, url: string) => {
    const template: string | null | ArrayBuffer = await readFileIntoArrayBuffer(file);
    const locale = 'es'

    try {
        const report = await createReport({
            template: template as Buffer,
            cmdDelimiter: ['{{', '}}'],
            additionalJsContext: {
            getImage: async (media: Media, properties: ImageProperties) => {
                const image = await getMediaImageData(media, url)
    
                return { ...properties, data: image }
            },
            getDate: (date: string) => {
                return formatDate(date, locale)
            },
            getTime: (date: string) => {
                return formatDate(date, locale, DateFormat.TIME)
            },
            getDateTime: (date: string) => {
                return formatDate(date, locale, DateFormat.DATE_TIME)
            },
            getInstrument: (code: string) => {
                return `Instrument ${code}`
            },
            getRepresentationServices: (services: Record<string, any>[]) => {
                return services.filter(service => PERFORMANCE_TYPES.includes(service.type))
            }
            },
            data: JSON.parse(data)
        });


        saveDataToFile(
            report,
            'report.docx',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        return template;

    } catch (e){
        alert(e)
    }
}

export default processTemplate;