
const dateExtraction = () => {
    function pad(s) {
        return s < 10 ? '0' + s : s;
    }
    const d = new Date();
    const date = [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
    const hours = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
    const fullDate = date + ' ' + hours;

    return fullDate;
};

module.exports = dateExtraction;