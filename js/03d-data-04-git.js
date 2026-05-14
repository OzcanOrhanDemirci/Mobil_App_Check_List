/* Category 04: Git and GitHub.
   One of 14 per-category data files split out of js/03-data.js in 1.1.0.
   Each appends its category record onto window.DATA; the array is then
   exposed as the const DATA by js/03-data.js. The split is to lower the
   merge-conflict surface for content contributors. */

(window.DATA = window.DATA || []).push(
  {
    id: "04",
    title: { tr: "Git ve GitHub", en: "Git and GitHub" },
    sub: { tr: "Sürüm kontrolü, takım çalışması ve hassas bilgilerin korunması.", en: "Version control, team collaboration, and protecting sensitive info." },
    features: [
      {
        id: "4.1",
        title: { tr: "Repo, Commit ve Push", en: "Repo, Commit and Push" },
        desc: { tr: "Projenin Git ile takip edilmesi ve GitHub'a yedeklenmesi.", en: "Tracking the project with Git and backing it up to GitHub." },
        mvp: { tr: "Proje GitHub'da bir repo'da. <code>git init</code>, <code>git add</code>, <code>git commit</code> ve <code>git push</code> akışı çalışıyor. Tüm takım üyeleri Settings → Collaborators ile davet edildi ve push yapabiliyor.", en: "The project lives in a GitHub repo. The <code>git init</code>, <code>git add</code>, <code>git commit</code>, <code>git push</code> flow works. All team members are invited via Settings → Collaborators and can push." },
        release: { tr: "<strong>Anlamlı commit mesajları</strong> yazılıyor. \"asdf\", \"test\", \"fix\" gibi anlamsız mesajlar yok. Mesajlar ne yapıldığını söylüyor (örn. \"Karanlık mod butonu eklendi\"). Düzenli aralıklarla push yapılıyor, herkes son sürümle çalışıyor.", en: "<strong>Meaningful commit messages</strong> are written. No \"asdf\", \"test\", \"fix\" messages. Messages say what was done (e.g. \"Added dark mode button\"). Regular pushes; everyone works on the latest." },
        simple: {
          mvp: {
            tr: "Projen <strong>GitHub'da bir kasada</strong> (\"repo\" deniyor) yedeklenmiş. Her gün veya birkaç saatte bir <strong>kaydetme</strong> (commit) ve <strong>yükleme</strong> (push) yapılıyor; bilgisayarın kaybolsa bile en son halini GitHub'dan geri indirebiliyorsun. Ekip varsa herkes davet edilmiş, herkes katkı sunabiliyor.",
            en: "Your project is <strong>backed up in a vault on GitHub</strong> (it's called a \"repo\"). Every day or every few hours you <strong>save (commit)</strong> and <strong>upload (push)</strong> your work; even if your computer is lost, you can pull the latest copy back from GitHub. If there's a team, everyone has been invited and can contribute."
          },
          release: {
            tr: "Her kayıtta (commit) ne yaptığını <strong>anlaşılır bir cümleyle</strong> yazıyorsun (örn. \"Karanlık mod butonu eklendi\"); \"asdf\", \"test\", \"deneme\" gibi mesajlar yok. Bu sayede ileride bir hata olduğunda hangi değişikliğin sebep olduğunu kolayca buluyorsun.",
            en: "Each save (commit) carries a <strong>clear message in plain language</strong> (e.g. \"Added dark mode button\"); no \"asdf\", \"test\", \"trying things\" messages. That way, if something breaks later, you can easily find which change caused it."
          }
        }
        ,
        howto: {
          mvp: {
            tr: "1) Bilgisayarına <strong>Git</strong> kur (<code>git --version</code> ile kontrol et). 2) <strong>github.com</strong>'da ücretsiz bir hesap aç ve yeni bir <strong>repository</strong> yarat (private veya public seçimi sana kalmış). 3) Proje klasöründe terminal aç: <code>git init</code>, <code>git add .</code>, <code>git commit -m \"İlk commit\"</code>, <code>git branch -M main</code>, <code>git remote add origin &lt;repo-url&gt;</code>, <code>git push -u origin main</code>. 4) GitHub Settings → Collaborators → tüm takım arkadaşlarını davet et; onlar daveti kabul etsin. 5) Her birinin <code>git clone</code> + kendi commit'leri + <code>git push</code> akışını test et.",
            en: "1) Install <strong>Git</strong> on your computer (verify with <code>git --version</code>). 2) Create a free account on <strong>github.com</strong> and create a new <strong>repository</strong> (private or public, your choice). 3) Open a terminal in your project folder: <code>git init</code>, <code>git add .</code>, <code>git commit -m \"First commit\"</code>, <code>git branch -M main</code>, <code>git remote add origin &lt;repo-url&gt;</code>, <code>git push -u origin main</code>. 4) On GitHub: Settings → Collaborators → invite every teammate; they accept the invite. 5) Test the <code>git clone</code> + own commit + <code>git push</code> flow for each one."
          },
          release: {
            tr: "1) Her commit mesajını <strong>tek satırlık, fiil ile başlayan, ne yapıldığını söyleyen</strong> bir cümle yap: \"Karanlık mod butonu eklendi\", \"Login crash hatası düzeltildi\". \"asdf\", \"test\", \"fix\" gibi mesajları yasakla. 2) <strong>Conventional Commits</strong> formatına geçmek istersen prefix kullan (<code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>refactor:</code>); ekip içinde tutarlı olsun. 3) Düzenli push alışkanlığı edin: günde en az bir kez push (uzun süre local'de tutulan commit'ler kaybolma riski). 4) <strong>.gitattributes</strong> dosyası ile satır sonu (LF / CRLF) sorunlarını çöz, ekip farklı işletim sistemlerinde olsa bile. <span class='hint'>İyi commit geçmişi 6 ay sonra bir hatayı bulmak için altın değerinde.</span>",
            en: "1) Make each commit message a <strong>one-line sentence starting with a verb, saying what was done</strong>: \"Add dark mode button\", \"Fix login crash\". Ban \"asdf\", \"test\", \"fix\" alone. 2) If you want to upgrade to <strong>Conventional Commits</strong>, use prefixes (<code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>refactor:</code>); keep it consistent in the team. 3) Make a regular push habit: at least once a day per person (long-uncommitted local work risks being lost). 4) Use a <strong>.gitattributes</strong> file to settle line-ending (LF / CRLF) issues so a cross-OS team works smoothly. <span class='hint'>A good commit history is gold when hunting a bug six months later.</span>"
          },
          simple: {
            mvp: {
              tr: "1) Bilgisayarına Git kur. 2) GitHub'da ücretsiz hesap aç ve <strong>yeni bir kasada</strong> (repo) projeni saklamak için bir alan yarat. 3) Proje klasöründe terminal/PowerShell açıp şu komutları sırayla yaz: <code>git init</code>, <code>git add .</code>, <code>git commit -m \"ilk yükleme\"</code>, sonra GitHub'ın sana verdiği komutla bu kasaya bağla ve gönder. AI'a \"yeni bir GitHub repo'suna projemi nasıl gönderirim\" diye sorabilirsin. 4) Ekipte kişi varsa GitHub'da Settings → Collaborators ile davet et.",
              en: "1) Install Git on your computer. 2) Open a free GitHub account and create a <strong>new vault (repo)</strong> to keep your project in. 3) Open a terminal/PowerShell in your project folder and type these commands in order: <code>git init</code>, <code>git add .</code>, <code>git commit -m \"first upload\"</code>, then use the command GitHub gives you to link to your vault and push. You can ask AI \"how do I push my project to a new GitHub repo\". 4) If you have teammates, invite them via Settings → Collaborators."
            },
            release: {
              tr: "1) Her kaydetme (commit) sırasında <strong>ne yaptığını açıklayan kısa bir cümle</strong> yaz (örn. \"Karanlık mod butonu eklendi\"); \"deneme\", \"asdf\", \"test\" gibi mesajlar yazma. 2) En az günde bir kez GitHub'a push et; uzun süre push etmeden çalışmak işini kaybetme riski yaratır. 3) İleride bir hata oluştuğunda hangi değişiklik sebep olmuş diye geçmişe bakacaksın; o yüzden mesajlar gelecekteki sen için yazılmış olmalı.",
              en: "1) When you save (commit), write a <strong>short sentence describing what you did</strong> (e.g. \"Added dark mode button\"); avoid \"trying\", \"asdf\", \"test\" messages. 2) Push to GitHub at least once a day; long stretches without pushing risk losing work. 3) Later, when a bug appears, you'll look back to find which change caused it; that's why messages should be written for future-you."
            }
          }
        }
      },
      {
        id: "4.2",
        title: { tr: "Branch ve Pull Request", en: "Branch and Pull Request" },
        desc: { tr: "Riskli değişiklikleri ana koddan ayrı yapmak ve birleştirmeden önce gözden geçirmek.", en: "Making risky changes off the main branch and reviewing before merging." },
        mvp: { tr: "Yeni özellik için <strong>kendi feature branch'inde</strong> çalışılıyor (<code>git checkout -b feature/karanlik-mod</code>). Direkt main branch'te kod YAZILMIYOR. Çakışma (merge conflict) çıkarsa panik yapılmıyor; işaretler manuel temizlenip commit ediliyor.", en: "New features are developed on <strong>their own feature branch</strong> (<code>git checkout -b feature/dark-mode</code>). Code is NOT written directly on main. If a merge conflict appears, no panic; markers are cleaned manually and committed." },
        release: { tr: "Branch'ler <strong>Pull Request ile</strong> main'e birleştiriliyor. PR açılınca takımdan en az bir kişi gözden geçiriyor. Birleşmiş, işi biten boş branch'ler siliniyor (<code>git branch -d</code>). <strong>main branch protected</strong>, direkt push yasak.", en: "Branches are merged to main <strong>via Pull Requests</strong>. When a PR is opened, at least one teammate reviews it. Empty merged branches are deleted (<code>git branch -d</code>). The <strong>main branch is protected</strong>; direct push is forbidden." },
        simple: {
          mvp: {
            tr: "Riskli veya büyük değişiklikler ana koddan <strong>ayrı bir kopyada</strong> (\"branch\" deniyor) yapılıyor; iş bitene kadar ana kod bozulmuyor. Aynı dosyayı iki kişi değiştirince <strong>çakışma</strong> olduğunda panik yapmadan hangi kısmın kalacağına karar veriliyor.",
            en: "Risky or large changes are made on a <strong>separate copy</strong> of the code (it's called a \"branch\"); the main code stays intact until you're done. When two people edit the same file and a <strong>conflict</strong> appears, you calmly decide which version stays."
          },
          release: {
            tr: "Her değişiklik ana koda eklenmeden önce <strong>takımdan en az bir kişi tarafından gözden geçiriliyor</strong> (\"Pull Request\" üzerinden). Doğrudan ana koda yazmak engellenmiş; böylece kazara bir hata herkesin koduna sızmıyor.",
            en: "Every change is <strong>reviewed by at least one teammate</strong> before being merged into the main code (via a \"Pull Request\"). Writing directly to the main code is blocked, so an accidental bug doesn't leak into everyone's code."
          }
        }
        ,
        howto: {
          mvp: {
            tr: "1) Yeni bir özellik için kendi branch'ini aç: <code>git checkout -b feature/karanlik-mod</code>. 2) Bu branch'te çalış, commit'ler at. 3) <code>git push -u origin feature/karanlik-mod</code> ile GitHub'a yolla. 4) Çakışma (merge conflict) olduğunda paniğe kapılma: dosyayı aç, <code>&lt;&lt;&lt;</code> / <code>===</code> / <code>&gt;&gt;&gt;</code> işaretlerini elle temizle, doğru kısımları bırak, <code>git add</code> + <code>git commit</code> et. AI'a \"merge conflict nasıl çözülür\" diye sorabilirsin. <span class='hint'>Direkt main branch'te kod yazma; main'i tertemiz tut.</span>",
            en: "1) Open your own branch for a new feature: <code>git checkout -b feature/dark-mode</code>. 2) Work on this branch and make commits. 3) Push to GitHub with <code>git push -u origin feature/dark-mode</code>. 4) When a merge conflict happens, don't panic: open the file, manually clean the <code>&lt;&lt;&lt;</code> / <code>===</code> / <code>&gt;&gt;&gt;</code> markers, keep the right pieces, then <code>git add</code> + <code>git commit</code>. You can ask AI \"how do I resolve a merge conflict\". <span class='hint'>Don't write code directly on main; keep main pristine.</span>"
          },
          release: {
            tr: "1) GitHub'da branch'i main'e merge etmek için <strong>Pull Request</strong> (PR) aç: branch sayfasında \"Compare & pull request\". 2) PR açıklaması ne yaptığını ve nasıl test edileceğini söyleyen kısa bir özet içersin. 3) <strong>En az 1 takım üyesinden Review</strong> iste; o onayladıktan sonra merge et. 4) GitHub Settings → Branches → main branch'i <strong>protect</strong> et: \"Require pull request reviews\" + \"Require status checks\" aç. 5) Merge sonrası branch'i sil (GitHub'ın \"Delete branch\" butonu); local'de <code>git branch -d feature/&lt;name&gt;</code> ile temizle. 6) Squash merge tercih ediliyorsa Settings → Pull Requests → \"Allow squash merging\"; her özellik tek bir temiz commit olur.",
            en: "1) Open a <strong>Pull Request</strong> (PR) on GitHub to merge the branch into main: click \"Compare & pull request\" on the branch page. 2) The PR description should be a short summary of what you did and how to test it. 3) Request a <strong>Review from at least one teammate</strong>; merge only after their approval. 4) Settings → Branches → <strong>protect</strong> the main branch: turn on \"Require pull request reviews\" + \"Require status checks\". 5) After merge, delete the branch (GitHub's \"Delete branch\" button); locally clean it with <code>git branch -d feature/&lt;name&gt;</code>. 6) If you prefer squash merges, Settings → Pull Requests → \"Allow squash merging\"; each feature becomes one clean commit."
          },
          simple: {
            mvp: {
              tr: "1) Yeni bir özelliğe başlamadan önce <strong>kodun bir kopyasını çıkar</strong> (buna \"branch\" deniyor): <code>git checkout -b yeni-ozellik</code>. 2) Bu kopyada çalış, ana kod bozulmaz. 3) Bitince GitHub'a yolla. 4) İki kişi aynı dosyayı değiştirip karıştığında çıkan \"çakışma\" mesajından korkma; AI'a \"git merge conflict çözmek\" diye sor; dosyayı açıp hangi kısmın kalacağına karar verirsin.",
              en: "1) Before starting a new feature, <strong>make a copy of the code</strong> (it's called a \"branch\"): <code>git checkout -b new-feature</code>. 2) Work on this copy; the main code stays safe. 3) When done, push to GitHub. 4) If two people edit the same file and a \"conflict\" message appears, don't worry: ask AI \"how to resolve git merge conflict\"; you open the file and decide which version to keep."
            },
            release: {
              tr: "1) Branch'ini ana koda eklemeden önce GitHub'da bir <strong>Pull Request</strong> (birleştirme isteği) aç. 2) Ekipten en az bir kişiye bakmasını söyle; onaylarsa birleştir. 3) GitHub Settings → Branches'tan ana branch'e (main) doğrudan yazmayı kapat; herkes Pull Request ile değişiklik göndermek zorunda olsun. Bu sayede kazara yapılan bir hata herkesin koduna sızmaz. 4) Birleştirilen branch'leri sil; karışıklık olmasın.",
              en: "1) Before merging your branch into main, open a <strong>Pull Request</strong> on GitHub. 2) Ask at least one teammate to look at it; once they approve, merge it. 3) In GitHub Settings → Branches, disable direct writes to the main branch so everyone goes through Pull Requests. That way an accidental bug doesn't leak into everyone's code. 4) Delete merged branches to keep things tidy."
            }
          }
        }
      },
      {
        id: "4.3",
        title: { tr: ".gitignore ve API Anahtarı Güvenliği", en: ".gitignore and API Key Safety" },
        desc: { tr: "Hassas dosyaların ve şifrelerin GitHub'a sızmaması.", en: "Keeping sensitive files and secrets out of GitHub." },
        mvp: { tr: "<code>.gitignore</code> dosyası mevcut. <strong>API anahtarları kodda hardcoded DEĞİL</strong>; bir <code>.env</code> dosyasında ve <code>.env</code> .gitignore'da. <span class='hint'>Bu en kritik güvenlik kuralı. Açıkta kalan API anahtarı saniyeler içinde botlar tarafından çalınır ve kotanı bitirir.</span>", en: "A <code>.gitignore</code> exists. <strong>API keys are NOT hardcoded</strong>; they live in a <code>.env</code> file, and <code>.env</code> is in .gitignore. <span class='hint'>This is the most critical security rule. An exposed API key gets stolen by bots within seconds and burns through your quota.</span>" },
        release: { tr: "<code>.env.example</code> şablonu repoda (gerçek değerler olmadan). Build, IDE, OS dosyaları (<code>build/</code>, <code>.vscode/</code>, <code>.DS_Store</code>) ignore edilmiş. Github'a yanlışlıkla anahtar pushlandıysa: anahtar derhal iptal edilip yenisi üretildi.", en: "An <code>.env.example</code> template lives in the repo (with no real values). Build, IDE, OS files (<code>build/</code>, <code>.vscode/</code>, <code>.DS_Store</code>) are ignored. If a key was accidentally pushed: it was immediately revoked and rotated." },
        simple: {
          mvp: {
            tr: "GitHub'a yüklenmesini istemediğin <strong>gizli dosyalar</strong> ayrı bir listeye eklenmiş (bu listenin adı <code>.gitignore</code>); bu dosyalar yanlışlıkla yüklenmiyor. <strong>API anahtarları, parolalar</strong> kodun içine yazılmamış; ayrı bir gizli dosyada ve bu dosya da o listeye eklenmiş. <span class='hint'>Bu en kritik kural. Açıkta kalan bir anahtar saniyeler içinde kötü niyetli botlar tarafından bulunur.</span>",
            en: "Files you don't want uploaded to GitHub are added to a <strong>secret-files list</strong> (called <code>.gitignore</code>); they don't accidentally upload. <strong>API keys and passwords</strong> are not written in the code; they live in a separate secret file, and that file is also on the list. <span class='hint'>This is the most critical rule. An exposed key gets discovered by malicious bots within seconds.</span>"
          },
          release: {
            tr: "Repo'da <strong>örnek bir gizli dosya</strong> (gerçek değerler olmadan) bulunuyor; yeni bir takım üyesi katıldığında bu örnek üzerinden kendi değerlerini doldurabiliyor. Eğer bir gün yanlışlıkla bir anahtar GitHub'a yüklendiyse anahtar derhal iptal edilip yenisi üretiliyor.",
            en: "The repo contains an <strong>example secret file</strong> (without real values); a new team member can fill in their own values from this template. If a key was ever accidentally pushed to GitHub, it was immediately revoked and rotated."
          }
        }
        ,
        howto: {
          mvp: {
            tr: "1) Proje kök klasöründe <code>.gitignore</code> dosyası oluştur (eğer yoksa). Framework'üne uygun template'i kullan: <a href='https://github.com/github/gitignore'>github.com/github/gitignore</a>'den Flutter / React Native / Swift / Android / Node şablonunu kopyala. 2) Hassas dosyaları ignore listesine ekle: <code>.env</code>, <code>*.keystore</code>, <code>GoogleService-Info.plist</code>, <code>google-services.json</code>, <code>local.properties</code>. 3) Eğer bir API anahtarı zaten koda yazılmışsa: <strong>derhal yeni anahtar üret</strong> (vendor console'dan), eskisini iptal et; <code>.env</code>'e taşı; kodda <code>process.env.X</code> / framework karşılığı ile oku. 4) Test et: <code>git status</code> ile gizli dosyaların listede olmadığını gör.",
            en: "1) Create a <code>.gitignore</code> in your project root (if missing). Use a framework-appropriate template: copy from <a href='https://github.com/github/gitignore'>github.com/github/gitignore</a> for Flutter / React Native / Swift / Android / Node. 2) Add sensitive files to the ignore list: <code>.env</code>, <code>*.keystore</code>, <code>GoogleService-Info.plist</code>, <code>google-services.json</code>, <code>local.properties</code>. 3) If an API key is already in code: <strong>rotate it immediately</strong> (in the vendor console), revoke the old one; move it to <code>.env</code>; read it from code via <code>process.env.X</code> or the framework equivalent. 4) Test: <code>git status</code> should not list the sensitive files."
          },
          release: {
            tr: "1) Repo'da bir <code>.env.example</code> dosyası oluştur (gerçek değerler boş): <code>API_KEY=</code>, <code>SUPABASE_URL=</code> gibi anahtar isimleri var ama değerleri YOK. Yeni ekip üyesi bunu kopyalayıp <code>.env</code> olarak adlandırıp kendi değerleriyle dolduruyor. 2) Build / IDE / OS dosyalarını da ignore et: <code>build/</code>, <code>.dart_tool/</code>, <code>node_modules/</code>, <code>.idea/</code>, <code>.vscode/</code> (ortak ayarlar hariç), <code>.DS_Store</code>, <code>Thumbs.db</code>. 3) Geçmişe sızmış anahtarları temizle: <code>git filter-branch</code> veya <code>bfg-repo-cleaner</code> ile geçmişten sil, sonra <code>git push --force</code> (ekibe haber ver). 4) GitHub <strong>Secret scanning</strong> (Settings → Code security → Secret scanning) aktif; gelecekteki sızıntılarda otomatik uyarı.",
            en: "1) Create a <code>.env.example</code> file in the repo (with empty real values): keys like <code>API_KEY=</code>, <code>SUPABASE_URL=</code> are present without values. A new teammate copies this to <code>.env</code> and fills in their own values. 2) Also ignore build / IDE / OS files: <code>build/</code>, <code>.dart_tool/</code>, <code>node_modules/</code>, <code>.idea/</code>, <code>.vscode/</code> (except shared settings), <code>.DS_Store</code>, <code>Thumbs.db</code>. 3) Clean up keys leaked into history: use <code>git filter-branch</code> or <code>bfg-repo-cleaner</code> to remove from history, then <code>git push --force</code> (warn the team). 4) Enable GitHub <strong>Secret scanning</strong> (Settings → Code security → Secret scanning); future leaks get auto-flagged."
          },
          simple: {
            mvp: {
              tr: "1) Proje klasöründe <code>.gitignore</code> adında bir dosya oluştur. AI'a sor: \"X framework'ü için .gitignore içeriği ne olmalı\". 2) İçine <strong>gizli dosyaların isimlerini</strong> yaz; özellikle <code>.env</code> dosyasını ekle. 3) Gerçek API anahtarlarını koda yazmaktan vazgeç: ayrı bir <code>.env</code> dosyasına koy, koddan o dosyadan okut. 4) <code>git status</code> komutu ile gizli dosyaların listede olmadığını doğrula.",
              en: "1) Create a file called <code>.gitignore</code> in your project folder. Ask AI: \"what should .gitignore contain for X framework\". 2) Inside, list <strong>names of secret files</strong>; especially add <code>.env</code>. 3) Stop writing real API keys in code: put them in a separate <code>.env</code> file and read them from there. 4) Run <code>git status</code> to confirm secret files are not listed."
            },
            release: {
              tr: "1) Repo'na bir <strong>örnek gizli dosya</strong> ekle (<code>.env.example</code>): içeride anahtar isimleri var ama değerleri yok. Yeni ekip üyesi bunu kopyalayıp kendi değerleriyle doldurabilir. 2) Eğer bir anahtar yanlışlıkla GitHub'a sızmış olabilir: o anahtarı <strong>derhal iptal et</strong> ve yenisini üret. 3) GitHub'ın \"Secret scanning\" özelliğini aç (Settings → Code security); ileride bir kaza olursa otomatik uyarı gelir.",
              en: "1) Add a <strong>sample secret file</strong> (<code>.env.example</code>) to your repo: it has the key names but no values. A new teammate copies it and fills in their own values. 2) If a key might have leaked to GitHub: <strong>revoke it immediately</strong> and generate a new one. 3) Enable GitHub's \"Secret scanning\" feature (Settings → Code security); future leaks get auto-flagged."
            }
          }
        }
      },
      {
        id: "4.4",
        title: { tr: "README ve Proje Dokümantasyonu", en: "README and Project Documentation" },
        desc: { tr: "Repo'ya gelen birinin projeyi anlamasını ve çalıştırabilmesini sağlamak.", en: "Letting someone arriving at the repo understand and run the project." },
        mvp: { tr: "<strong>README.md</strong> dosyası var. Projenin <strong>ne olduğu</strong> ve <strong>nasıl çalıştırılacağı</strong> yazıyor.", en: "A <strong>README.md</strong> exists. It describes <strong>what the project is</strong> and <strong>how to run it</strong>." },
        release: { tr: "README'de <strong>kurulum adımları</strong>, çevre değişkenleri (.env.example referansı), çalıştırma komutları, ekran görüntüleri/GIF, ekip üyeleri ve lisans bilgisi var. Proje açıklaması, etiketler (topics) ve preview görseli ayarlandı.", en: "The README has <strong>setup steps</strong>, env vars (referencing .env.example), run commands, screenshots/GIFs, team members and license info. Repo description, topics and preview image are set." }
        ,
        howto: {
          mvp: {
            tr: "1) Proje kök klasöründe <code>README.md</code> adında bir dosya oluştur. 2) İçine en az iki başlık yaz: <strong>## Proje Nedir?</strong> (2-3 cümle), <strong>## Nasıl Çalıştırılır?</strong> (kurulum + çalıştırma komutları: <code>npm install</code> / <code>flutter pub get</code> / <code>pod install</code> vb.). 3) Markdown önizlemesini GitHub'da kontrol et: başlıklar ve kod blokları doğru göründüğünden emin ol. <span class='hint'>AI'a \"şu proje için README taslağı yaz\" diyebilirsin; sonra düzenlersin.</span>",
            en: "1) Create a file called <code>README.md</code> in the project root. 2) Write at least two headings: <strong>## What Is This?</strong> (2-3 sentences), <strong>## How to Run</strong> (install + run commands: <code>npm install</code> / <code>flutter pub get</code> / <code>pod install</code>, etc.). 3) Check the Markdown preview on GitHub: confirm headings and code blocks render correctly. <span class='hint'>You can ask AI to \"draft a README for this project\" and then edit it.</span>"
          },
          release: {
            tr: "1) README'yi genişlet: <strong>Kurulum (Prerequisites)</strong>, <strong>Çevre değişkenleri</strong> (<code>.env.example</code>'a referans), <strong>Çalıştırma</strong>, <strong>Build</strong>, <strong>Test</strong>, <strong>Ekran görüntüleri / GIF</strong>, <strong>Mimari özet</strong>, <strong>Ekip üyeleri</strong>, <strong>Lisans</strong>. 2) Ekran görüntülerini <code>docs/</code> veya <code>assets/</code> klasörüne koy ve relative path ile göster. 3) GitHub repo sayfasında: <strong>Description</strong>, <strong>Website</strong>, <strong>Topics</strong> (örn. <code>flutter</code>, <code>firebase</code>, <code>mobile-app</code>) doldur. <strong>About</strong> sağ tarafta öne çıksın. 4) Repo preview için <strong>Social preview image</strong> yükle (Settings → General → Social preview, 1280×640px). 5) Bir <code>LICENSE</code> dosyası ekle (MIT / Apache 2.0 / proprietary).",
            en: "1) Expand the README: <strong>Prerequisites</strong>, <strong>Environment variables</strong> (reference <code>.env.example</code>), <strong>Run</strong>, <strong>Build</strong>, <strong>Test</strong>, <strong>Screenshots / GIFs</strong>, <strong>Architecture overview</strong>, <strong>Team</strong>, <strong>License</strong>. 2) Put screenshots in <code>docs/</code> or <code>assets/</code> and show them via relative paths. 3) On the GitHub repo page, fill in <strong>Description</strong>, <strong>Website</strong>, <strong>Topics</strong> (e.g. <code>flutter</code>, <code>firebase</code>, <code>mobile-app</code>). The <strong>About</strong> panel on the right should look polished. 4) Upload a <strong>Social preview image</strong> for the repo (Settings → General → Social preview, 1280×640px). 5) Add a <code>LICENSE</code> file (MIT / Apache 2.0 / proprietary)."
          },
          simple: {
            mvp: {
              tr: "1) Proje klasöründe <code>README.md</code> adında bir dosya oluştur. 2) İçine iki başlık yaz: \"Bu Proje Ne?\" ve \"Nasıl Çalıştırılır?\". Her birini 2-3 cümle doldur. AI'a \"şu proje için README taslağı hazırla\" diye sorabilirsin. 3) GitHub'da repo sayfasına git, README'nin güzel göründüğünden emin ol.",
              en: "1) Create a file called <code>README.md</code> in your project folder. 2) Write two headings: \"What Is This?\" and \"How to Run\". Fill each with 2-3 sentences. You can ask AI to \"draft a README for this project\". 3) Go to the repo page on GitHub and check that the README looks good."
            },
            release: {
              tr: "1) README'ye daha fazla bölüm ekle: kurulum şartları, çalıştırma adımları, ekran görüntüleri, ekip arkadaşları, lisans bilgisi. 2) Ekran görüntülerini bir <code>docs/</code> klasörüne koy ve README'den göster. 3) GitHub repo sayfasında üst sağdaki <strong>About</strong> bölümünü düzenle (açıklama + etiketler). 4) Bir <code>LICENSE</code> dosyası ekle (AI'a \"MIT license şablonu ver\" diye sorabilirsin).",
              en: "1) Add more sections to the README: prerequisites, run steps, screenshots, teammates, license info. 2) Put screenshots in a <code>docs/</code> folder and show them in the README. 3) On the GitHub repo page, edit the <strong>About</strong> panel on the top-right (description + topics). 4) Add a <code>LICENSE</code> file (you can ask AI to \"give me the MIT license template\")."
            }
          }
        }
      }
    ]
  },
);
