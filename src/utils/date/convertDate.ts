export default function convertData(dateTime:string):string{
    const date = new Date(dateTime).toLocaleString();
    return date;
}