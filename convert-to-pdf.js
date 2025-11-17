// Script untuk convert Markdown ke PDF
// Install dependencies: npm install markdown-pdf

const markdownpdf = require("markdown-pdf");
const fs = require("fs");

const inputFile = "PANDUAN-LENGKAP-APLIKASI.md";
const outputFile = "PANDUAN-LENGKAP-APLIKASI.pdf";

console.log('Converting Markdown to PDF...');

markdownpdf()
  .from(inputFile)
  .to(outputFile, function () {
    console.log('✅ PDF berhasil dibuat: ' + outputFile);
  });
