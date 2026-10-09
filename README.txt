MAISON MATHIS - STATIC WEBSITE  (https://maison-mathis.com)
==============================================================

Pages (each has its own address, title, description and structured data)
  /                      Home
  /winter-wonderland/    Winter Wonderland
  /franchise/            Franchise (+ /franchise/thank-you/ after a form is sent)
  /arabian-ranches/  /voco-the-palm/  /hasselt/            open restaurants
  /dubai-south/  /al-mouj/  /pullman-jlt/                  opening soon

HOW TO PUBLISH ON NETLIFY
  The site is deployed from the GitHub repository (branch main). Replace the files in the repository folder with the
  files in this zip (copy over and replace; do not delete the folder first), then make ONE commit and push.
  Netlify publishes automatically within seconds. No build command, publish directory = the root.

FORMS (Netlify Forms)
  "franchise-enquiry"  the franchise form on /franchise/
  "guest-interest"     the "Tell me when it opens" form on the home page
  Both email info@creneauhospitality.com through the Netlify notification set up under Forms > Form notifications.
  If a form cannot send, the visitor sees a link to email the same address directly.

FILES
  _headers: styles, scripts and fonts are kept by browsers for a year (they get a new file name whenever they change),
  page files are always re-checked, images are kept for 7 days. If you replace an image, give the new file a new name.
