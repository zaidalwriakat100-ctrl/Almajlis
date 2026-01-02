const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sessions.json', 'utf8'));

console.log('='.repeat(60));
console.log('تحليل ملف الجلسات');
console.log('='.repeat(60));
console.log(`إجمالي عدد الجلسات: ${data.length}`);
console.log('');

// Group by term
const terms = {};
data.forEach(s => {
    if (!terms[s.term]) terms[s.term] = [];
    terms[s.term].push(s);
});

console.log('توزيع الجلسات حسب الدورة:');
Object.keys(terms).forEach(term => {
    console.log(`  - ${term}: ${terms[term].length} جلسة`);
});
console.log('');

console.log('قائمة الجلسات:');
console.log('-'.repeat(60));
data.forEach((s, i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ${s.title}`);
    console.log(`    الدورة: ${s.term}`);
    console.log(`    التاريخ: ${s.date || 'غير محدد'}`);
    console.log(`    المدة: ${s.duration || 'غير محددة'}`);
    console.log(`    عدد المتحدثين: ${s.num_speakers || 'غير محدد'}`);
    if (s.youtube && s.youtube.url) {
        console.log(`    الفيديو: ${s.youtube.url}`);
    }
    console.log('');
});
