const fs = require('fs');
let content = fs.readFileSync('src/pages/MainScreen.tsx', 'utf8');

// Replace the dummy import and CURRENT_MANAGER
content = content.replace(/import \{ getApprovalRequests \} from '\.\.\/utils\/storage';\r?\nconst CURRENT_MANAGER = '.*?';/g, '');

// Inside the component, define state for managerName
let newComponentStart = `export default function MainScreen() {
  const navigate = useNavigate();
  const { showAlert } = usePopup();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const managerName = localStorage.getItem('managerName') || '매니저';

  useEffect(() => {
    const managerId = localStorage.getItem('managerId');
    if (managerId) {
      fetch('http://localhost:8080/api/approvals?managerId=' + managerId)
        .then(res => res.json())
        .then(data => {
          const count = data.filter((req: any) => req.status === 'PENDING').length;
          setPendingApprovals(count);
        })
        .catch(err => console.error(err));
    }
  }, []);`;

content = content.replace(/export default function MainScreen\(\) \{[\s\S]*?\}, \[\]\);/g, newComponentStart);

// Update the greeting text
content = content.replace(/<h1 className="text-3xl mb-2">.*<\/h1>/g, '<h1 className="text-3xl mb-2">환영합니다, {managerName}님!</h1>');

fs.writeFileSync('src/pages/MainScreen.tsx', content, 'utf8');
