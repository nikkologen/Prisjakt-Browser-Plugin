// Development only: runs the actual DOM discovery code against fetched HTML.
const {parseHTML} = require('linkedom');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
async function main() {
 let blocked = false;
 for (const [name,url] of Object.entries({deals:'https://www.prisjakt.no/tema/dagens-tilbud',home:'https://www.prisjakt.no/',category:'https://www.prisjakt.no/category.php?k=502',search:'https://www.prisjakt.no/search?query=kaffemaskin',product:'https://www.prisjakt.no/product.php?p=4220665'})) {
  const response = await fetch(url);
  const html = await response.text();
  if(!response.ok) {console.error(name + ': HTTP ' + response.status + '; browser verification required'); blocked = true; continue;}
  const {document} = parseHTML(html);
  const context = vm.createContext({document,location:new URL(url),URL,Intl,Date});
  for(const file of ['stats','dom']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/'+file+'.js'),'utf8'),context);
  const targets = context.PJLow.discover();
  assert.ok(targets.length > 0,name + ': no discoverable prices');
  assert.ok(targets.every(t => t.current > 0 && /^\d+$/.test(t.id)));
  console.log(name + ': ' + targets.length + ' targets; first price ' + targets[0].current + ' kr');
 }
 if(blocked) process.exitCode = 2;
}
main().catch(error => {console.error(error);process.exitCode=1;});
