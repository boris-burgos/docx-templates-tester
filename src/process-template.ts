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

export function isValidDate(d: any): boolean {
    return d instanceof Date && !isNaN(d.getTime())
}
  
export function getValidDate(d: any): Date | null {
    if (isValidDate(d)) {
        return d
    } else if (typeof d === 'string') {
        const date = new Date(d)
        if (isValidDate(date)) {
        return date
        }
    }

    return null
}

export function formatDate(date: string | Date | null | undefined, locale?: string, format?: DateFormat, tz?: string) {
    const d = getValidDate(date)
    const options: Intl.DateTimeFormatOptions = { ...FORMATS[format || DateFormat.DATE] }
  
    if (tz) {
      options.timeZone = tz
    }
  
    if (d != null) {
      return d.toLocaleString(locale || 'es', options)
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

function getMediaUrlParams(params?: MediaUrlParams) {
    if (params?.resize?.size) {
      return `?r=${params.resize.size.w}x${params.resize.size.h}`
    } else if (params?.resize?.proportions) {
      return `?p=${params.resize.proportions.w}x${params.resize.proportions.h}`
    }
  
    return ''
}

function getMediaUrl(media: Media, url: string, params?: MediaUrlParams) {
    if (PUBLIC_MEDIA_TYPES.includes(media.mediaType)) {
        return `${url}/api/assets/media/public/${media.id}/${media.name}${getMediaUrlParams(params)}`
    }

    return `/api/assets/media/${media.id}/${media.name}${getMediaUrlParams(params)}`
}
export interface MediaUrlParams {
    resize?: {
      proportions?: { w: number; h: number }
      size?: { w: number; h: number }
    }
  }

const getMediaImageData = async (media: Media, url: string, params?: MediaUrlParams, ) => {
    const mediaUrl = getMediaUrl(media, url, params)
    const response = await fetch(mediaUrl)
    const imageBlob = await response.blob()
  
    return await getImageBase64(imageBlob)
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

const processTemplate = async (file: File, data: string, url: string, tz?: string) => {
    const template: string | null | ArrayBuffer = await readFileIntoArrayBuffer(file);
    const locale = 'es'

    try {
        const report = await createReport({
            template: template as Buffer,
            cmdDelimiter: ['{{', '}}'],
            additionalJsContext: {
                getImage: async (media: Media, props: ImageProperties) => {
                    const image = await getMediaImageData(media, url, {
                      resize: { proportions: { w: props.width, h: props.height } }
                    })
                    const extension = '.png'
                    // Resized images are always png
                    /*
                  if (media.mimeType) {
                      extension = `.${media.mimeType.split('/').pop() || 'png'}`
                    }
                  */
      
                    return { ...props, data: image, extension }
                  },
            getDate: (date: string) => {
                return formatDate(date, locale, DateFormat.DATE, tz)
            },
            getTime: (date: string) => {
                return formatDate(date, locale, DateFormat.TIME, tz)
            },
            getDateTime: (date: string) => {
                return formatDate(date, locale, DateFormat.DATE_TIME, tz)
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