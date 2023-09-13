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

const processTemplate = async (file: File, data: string) => {
    const template: string | null | ArrayBuffer = await readFileIntoArrayBuffer(file);

    const report = await createReport({
        template: template as Buffer,
        cmdDelimiter: ['{{', '}}'],
        data: JSON.parse(data)
    });

    saveDataToFile(
        report,
        'report.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    return template;
}

export default processTemplate;