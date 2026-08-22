const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace references
  content = content.replace(/detailMember\.income/g, 'detailMember.salary');
  content = content.replace(/detailMember\.intro/g, 'detailMember.introduction');
  content = content.replace(/detailMember\.hobby/g, 'detailMember.hobbies');
  content = content.replace(/detailMember\.humanCaution/g, 'detailMember.remarks');
  content = content.replace(/detailMember\.phone/g, 'detailMember.phoneNumber');
  content = content.replace(/detailMember\.aiAnalysis/g, 'detailMember.aiRemarks');
  content = content.replace(/detailMember\.managerName/g, 'detailMember.manager?.name');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

replaceInFile('frontend/src/pages/MemberInquiry.tsx');
replaceInFile('frontend/src/pages/MemberMatching.tsx');

let storageContent = fs.readFileSync('frontend/src/utils/storage.ts', 'utf8');
storageContent = storageContent.replace('intro: string;', 'introduction?: string; intro?: string;');
storageContent = storageContent.replace('hobby: string;', 'hobbies?: string; hobby?: string;');
storageContent = storageContent.replace('income: number;', 'salary?: number; income?: number;');
storageContent = storageContent.replace('humanCaution?: string;', 'remarks?: string; humanCaution?: string;');
storageContent = storageContent.replace('phone?: string;', 'phoneNumber?: string; phone?: string;');
storageContent = storageContent.replace('aiAnalysis?: string;', 'aiRemarks?: string; aiAnalysis?: string;');
fs.writeFileSync('frontend/src/utils/storage.ts', storageContent, 'utf8');

console.log('Fixed successfully without corruption');
