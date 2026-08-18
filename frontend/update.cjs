const fs = require('fs');
let content = fs.readFileSync('src/pages/MemberInquiry.tsx', 'utf8');

const infoViewReplacement = `const handleRequestInfoView = async (targetMember: Member) => {
    const managerId = localStorage.getItem('managerId');
    if (!managerId || !targetMember.managerId) return;

    try {
      const res = await fetch('http://localhost:8080/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'INFO_VIEW',
          requesterId: managerId,
          targetManagerId: targetMember.managerId,
          targetMemberId: targetMember.id
        })
      });

      if (res.ok) {
        showAlert(targetMember.managerName + ' 담당자에게 열람 승인 요청을 보냈습니다.');
      } else {
        showAlert('요청에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
      showAlert('요청 중 오류가 발생했습니다.');
    }
  };`;

const transferReplacement = `const handleTransferConfirm = async () => {
    if (!selectedManager) {
      showAlert('담당 매니저를 선택해주세요.');
      return;
    }
    
    const managerId = localStorage.getItem('managerId');
    if (!managerId) return;

    try {
      for (const member of selectedForTransfer) {
        await fetch('http://localhost:8080/api/approvals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'TRANSFER',
            requesterId: managerId,
            targetManagerId: selectedManager.id,
            targetMemberId: member.id
          })
        });
      }
      
      showAlert(\`선택한 담당자(\${selectedManager.name})에게 담당 변경 승인 요청을 보냈습니다.\`);
      setIsManagerModalOpen(false);
      setIsTransferMode(false);
      setSelectedForTransfer([]);
      setSelectedManager(null);
      setManagerSearchTerm('');
    } catch (e) {
      console.error(e);
      showAlert('담당 변경 요청 중 오류가 발생했습니다.');
    }
  };`;

content = content.replace(/const handleRequestInfoView = \(targetMember: Member\) => \{[\s\S]*?\};/g, infoViewReplacement);
content = content.replace(/const handleTransferConfirm = \(\) => \{[\s\S]*?\};/g, transferReplacement);

fs.writeFileSync('src/pages/MemberInquiry.tsx', content, 'utf8');
console.log('Replaced successfully.');
