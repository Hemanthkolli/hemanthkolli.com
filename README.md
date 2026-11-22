# hemanthkolli.com

Personal website. Plain HTML/CSS/JS, no build step.

- `index.html`: home (about, experience, projects, latest writing, contact)
- `blog/`: blog index and posts. To add a post, copy a post file, then link it in `blog/index.html`, in the "latest writing" list on the home page, and in `sitemap.xml`.
- `css/style.css`: all styles; colours are variables at the top
- `js/main.js`: theme toggle, mobile menu, typing effect, blog filter
- `CNAME`, `robots.txt`, `sitemap.xml`, `404.html`: hosting and SEO files for hemanthkolli.com

## Preview locally

    python3 -m http.server 8080    # then open http://localhost:8080

## Publish on GitHub Pages with hemanthkolli.com

1. Create a public GitHub repository (for example `hemanthkolli.com`) and push these files to `main`.
2. In the repository, go to Settings → Pages → Source: "Deploy from a branch", choose `main` and `/ (root)`.
3. Under Custom domain, enter `hemanthkolli.com` (the `CNAME` file already contains it).
4. At your domain registrar, set these DNS records:

   | Type  | Name | Value                     |
   |-------|------|---------------------------|
   | A     | @    | 185.199.108.153           |
   | A     | @    | 185.199.109.153           |
   | A     | @    | 185.199.110.153           |
   | A     | @    | 185.199.111.153           |
   | AAAA  | @    | 2606:50c0:8000::153       |
   | AAAA  | @    | 2606:50c0:8001::153       |
   | AAAA  | @    | 2606:50c0:8002::153       |
   | AAAA  | @    | 2606:50c0:8003::153       |
   | CNAME | www  | `hemanthkolli.github.io` |

   Remove any other A/AAAA records for `@` (for example the registrar's parking page).
5. After DNS has propagated (minutes up to a few hours), tick "Enforce HTTPS" in Settings → Pages.
6. Optional but recommended: verify the domain under your GitHub account (Settings → Pages → Verified domains) so nobody else can claim it.
