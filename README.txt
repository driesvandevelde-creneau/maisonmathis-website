MAISON MATHIS - STATIC WEBSITE  (https://maison-mathis.com)
==============================================================

Pages (each has its own address, title, description and structured data)
  /                      Home            index.html
  /winter-wonderland/    Winter Wonderland   winter-wonderland/index.html
  /franchise/            Franchise       franchise/index.html
  /arabian-ranches/      Arabian Ranches arabian-ranches/index.html
  /voco-the-palm/        voco The Palm   voco-the-palm/index.html
  /hasselt/              Hasselt         hasselt/index.html
  /dubai-south/          Dubai South (opening soon)
  /al-mouj/              Al Mouj (opening soon)
  /pullman-jlt/          Pullman JLT (opening soon)

Also included: assets/ (css, js, images, fonts), sitemap.xml, robots.txt, 404.html

HOW TO PUBLISH ON NETLIFY
1. Drag this whole folder onto Netlify (or connect it to a Git repository). The folder that contains
   index.html must be the site root. Netlify serves /franchise/ from franchise/index.html automatically
   and uses 404.html for missing pages.
2. Add the domain maison-mathis.com under Site configuration > Domain management and switch on HTTPS.
3. Submit https://maison-mathis.com/sitemap.xml in Google Search Console.

FRANCHISE FORM (Netlify Forms)
The form on /franchise/ is named "franchise-enquiry". Netlify finds it automatically when the site is deployed.
To receive the enquiries by email:
  Netlify > your site > Forms > Form notifications > Add notification > Email notification
  Email to notify: info@creneauhospitality.com      Form: franchise-enquiry
Visitors are sent to /franchise/thank-you/ after sending. Each submission is also kept in the Forms tab.
Spam is limited by a hidden honeypot field; add reCAPTCHA in the Netlify form settings if spam appears.
If the form cannot send, the visitor sees a link to email info@creneauhospitality.com directly.

BEFORE LAUNCH
- Add a preview image for link sharing (og:image) to the <head> of each page.
- Add a privacy policy and cookie notice (Google Analytics is installed).

FILES FOR NETLIFY
- _headers: tells browsers to keep images, fonts and scripts so repeat visits are fast
  (images 7 days, css/js 1 day, fonts 1 year). If you replace an image, give the new file a new name.
