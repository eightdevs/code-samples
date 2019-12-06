const fs = require('fs');
const path = require('path');
const {parse} = require('node-html-parser');
const json2xls = require('json2xls');

const file = fs.readFileSync(path.join(__dirname , 'index.html'));
const root = parse(file.toString());

let rows = root.querySelectorAll('.keyword-line');

let json = [];

for(let i = 0; i < rows.length ; i++){
    let row = rows[i].toString();
    let item = {};
    row = parse(row);

    let keyword = row.querySelector('.list__cell--keyword').text.trim();
    let popularity = row.querySelector('.list__cell--popularity').childNodes.find(r => r.tagName === 'div').text.trim();
    let total_apps = row.querySelector('.list__cell--m').childNodes.find(r => r.tagName === 'div').text.trim();
    let current_rank = row.querySelectorAll('.list__cell--m')[1].childNodes.find(r => r.tagName === 'div').text.trim();

    item.current_rank = current_rank;
    item.total_apps = total_apps;
    item.keyword = keyword;
    item.popularity = popularity;
    json.push(item);
}

let xls = json2xls(json);

fs.writeFileSync(`${new Date()}-file.xlsx`, xls, 'binary');
