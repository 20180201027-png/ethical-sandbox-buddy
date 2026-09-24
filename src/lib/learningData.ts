export type LearningStageId = 'beginner' | 'intermediate' | 'advanced';

export interface LearningStage {
  id: LearningStageId;
  label: string;
  shortLabel: string;
  promise: string;
  focus: string;
  color: 'green' | 'amber' | 'red';
  lessonCount: number;
  topics: string[];
  commands: string[];
}

export const LEARNING_STAGES: LearningStage[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    shortLabel: '01',
    promise: 'Build the mental model',
    focus: 'Linux, networking, reconnaissance, and safe lab habits',
    color: 'green',
    lessonCount: 18,
    topics: ['Linux & shell basics', 'TCP/IP and DNS', 'Passive recon', 'Reading scan output'],
    commands: ['help', 'whois example.com', 'dig example.com', 'nmap -sV 192.168.1.1'],
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    shortLabel: '02',
    promise: 'Find and explain weaknesses',
    focus: 'Web testing, enumeration, authentication risks, and vulnerability triage',
    color: 'amber',
    lessonCount: 24,
    topics: ['Web attack surface', 'HTTP requests', 'Access control', 'SQL injection concepts'],
    commands: ['gobuster dir -u http://192.168.1.1 -w common.txt', 'nikto -h http://192.168.1.1', 'curl -v http://192.168.1.1', 'sqlmap -u "http://site.com/?id=1" --dbs'],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    shortLabel: '03',
    promise: 'Think like a defender',
    focus: 'Exploit chains, credentials, wireless risks, post-exploitation, and reporting',
    color: 'red',
    lessonCount: 31,
    topics: ['Exploit validation', 'Credential security', 'Wireless defense', 'Detection & reporting'],
    commands: ['msfconsole', 'hydra -l admin -P rockyou.txt 192.168.1.1 ssh', 'aircrack-ng -w rockyou.txt capture.cap', 'john --wordlist=rockyou.txt hashes.txt'],
  },
];

export const getLearningStage = (id: LearningStageId) =>
  LEARNING_STAGES.find(stage => stage.id === id) ?? LEARNING_STAGES[0];

export const COMMAND_LESSONS = [
  { command: 'nmap -sV 192.168.1.1', stage: 'beginner' as LearningStageId, concept: 'Service discovery', outcome: 'Maps reachable services and versions so a tester can compare exposure with the intended design.', defense: 'Close unused ports, segment networks, patch services, and monitor unexpected scans.' },
  { command: 'dig example.com', stage: 'beginner' as LearningStageId, concept: 'DNS investigation', outcome: 'Shows how names resolve and which records reveal the public attack surface.', defense: 'Review DNS records, remove stale entries, and restrict zone transfers.' },
  { command: 'gobuster dir -u http://192.168.1.1 -w common.txt', stage: 'intermediate' as LearningStageId, concept: 'Content discovery', outcome: 'Checks common paths and highlights forgotten panels, backups, and exposed files in the lab.', defense: 'Remove backups from web roots, enforce access control, and return consistent error responses.' },
  { command: 'curl -v http://192.168.1.1', stage: 'intermediate' as LearningStageId, concept: 'HTTP inspection', outcome: 'Makes request and response headers visible so students can reason about sessions, redirects, and server behavior.', defense: 'Use secure headers, HTTPS, safe cookie flags, and avoid leaking version details.' },
  { command: 'sqlmap -u "http://site.com/?id=1" --dbs', stage: 'intermediate' as LearningStageId, concept: 'SQL injection validation', outcome: 'In a permitted lab, tests whether input changes a database query and reports evidence without requiring a real target.', defense: 'Use parameterized queries, input validation, least-privilege database accounts, and logging.' },
  { command: 'hydra -l admin -P rockyou.txt 192.168.1.1 ssh', stage: 'advanced' as LearningStageId, concept: 'Authentication resilience', outcome: 'Models repeated login attempts so learners can see why weak passwords and unlimited retries are dangerous.', defense: 'Use MFA, rate limits, lockout controls, strong password storage, and alerting.' },
  { command: 'john --wordlist=rockyou.txt hashes.txt', stage: 'advanced' as LearningStageId, concept: 'Password auditing', outcome: 'Demonstrates offline password-strength testing against sample hashes, not live accounts.', defense: 'Hash with a modern salted password KDF, reject breached passwords, and protect credential stores.' },
  { command: 'aircrack-ng -w rockyou.txt capture.cap', stage: 'advanced' as LearningStageId, concept: 'Wireless security', outcome: 'Explains how captured handshakes are audited in a controlled lab and why weak Wi-Fi passwords fail.', defense: 'Use WPA3 or strong WPA2 keys, isolate guests, update access points, and detect rogue devices.' },
];

export const DEFENDER_TOPICS = [
  { title: 'Reduce attack surface', detail: 'Inventory assets, remove unused services, segment sensitive systems, and keep an owner for every exposed port.' },
  { title: 'Validate, then prioritize', detail: 'A scanner result is a lead. Confirm impact, affected versions, exploitability, and business context before calling it a finding.' },
  { title: 'Protect identity', detail: 'MFA, password managers, rate limits, secure session cookies, and least privilege stop many attack chains early.' },
  { title: 'Make evidence useful', detail: 'Record scope, timestamps, reproduction steps, impact, screenshots, and a specific remediation with every report.' },
];