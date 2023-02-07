const PDFDocument = require('pdfkit');
const path = require('path')
const parentDir = (path.resolve(__dirname, '..'));

function buildPDF(dataToWrite, dataCallback, endCallBack) {
  console.log(dataToWrite);
    const doc = new PDFDocument();
    doc.on('data', dataCallback)
    doc.on('end', endCallBack)

    var imageWidth = 100;

    doc.image(parentDir+'/public/commonImages/dressed-up-icon.png', (doc.page.width - imageWidth) / 2, doc.y,  {
        fit: [100, 100],
        // align: 'center',
        // valign: 'center'
      });
      doc.moveDown();

    doc.fontSize(25).text('SALES REPORT for Dressed-Up');
    doc.fontSize(18).text(new Date().toLocaleString());

    doc.moveDown();
    doc.moveDown();

    doc.fontSize(14)
   .text('Total number of sales today : '+ dataToWrite.salesNumberToday)
   .text('Total revenue from sales today : Rs.'+ Math.round(dataToWrite.salesAmountToday.total))
   .text('Total GST collected today : Rs.'+ dataToWrite.salesAmountToday.tax);

   doc.moveDown();
   doc.moveDown();

   doc.fontSize(14)
   .text('Total number of sales this month : '+ dataToWrite.salesNumberMonth)
   .text('Total revenue from sales this month : Rs.'+ Math.round(dataToWrite.salesAmountMonth.total))
   .text('Total GST collected this month : Rs.'+ dataToWrite.salesAmountMonth.tax);

//    doc.font('Helvetica').fontSize(14)
//    .text(totalSalesToday, doc.x + (doc.page.width - 100) - 20, doc.y + 20, { align: 'right'})
//    .text(totalRevenueToday, doc.x + (doc.page.width - 100) - 20, doc.y + 40, { align: 'right'})
//    .text(totalSalesToday, doc.x + (doc.page.width - 100) - 20, doc.y + 20, { align: 'right'})
//    .text(totalRevenueToday, doc.x + (doc.page.width - 100) - 20, doc.y + 40, { align: 'right'})
    doc.end();
}

module.exports = { buildPDF };