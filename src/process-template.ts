import createReport from 'docx-templates';





const readFileIntoArrayBuffer = (fd: File): Promise<string | null | ArrayBuffer> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(fd);
    });





const processTemplate = async (file: File) => {


    const template: string | null | ArrayBuffer = await readFileIntoArrayBuffer(file);


    const report = await createReport({
        template: template as Buffer,
        data: {name: 'John', surname: 'Appleseed'},
    });





     return template;


}


/*
const onTemplateChosen = async () => {
    const template = await readFileIntoArrayBuffer(myFile);
    const report = await createReport({
        template,
        data: { name: 'John', surname: 'Appleseed' },
    });
    saveDataToFile(
        report,
        'report.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
};

// Load the user-provided file into an ArrayBuffer
const readFileIntoArrayBuffer = fd =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(fd);
    });


 */



export default processTemplate;