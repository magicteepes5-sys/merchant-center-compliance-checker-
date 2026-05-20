import { processCsvFeed } from './feed-csv-processor.js';

const sampleCsv = `id,title,description,link,image_link,price,availability
sku-1,"  Great   Product  ","desc one",www.example.com/p1,https://example.com/p1.jpg,$12.5,IN_STOCK
sku-1,"Bad\u0007Title",,"notaurl",example.com/no-scheme,12.999 usd,unknown
,No Id Product,desc,https://example.com/p3,https://example.com/p3.jpg,18.2,preorder`;

const result = processCsvFeed(sampleCsv, { defaultCurrency: 'USD' });

console.log('rowsParsed', result.rowsParsed);
console.log('issueCount', result.issues.length);
console.log('ruleRunCounts', result.ruleRunCounts);
console.log('firstCleanedRow', result.cleanedRows[0]);

if (result.rowsParsed !== 3) {
  throw new Error(`Expected 3 rows, got ${result.rowsParsed}`);
}

if (!result.issues.some((issue) => issue.code === 'DUPLICATE_ID')) {
  throw new Error('Expected duplicate ID issue');
}

if (!result.issues.some((issue) => issue.code === 'MISSING_REQUIRED_ATTRIBUTE' && issue.attribute === 'id')) {
  throw new Error('Expected missing required id issue');
}

if (!result.issues.some((issue) => issue.code === 'PRICE_FORMAT_NORMALIZED')) {
  throw new Error('Expected price normalization issue');
}

console.log('feed-validation-engine demo assertions passed');
