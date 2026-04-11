/**
 * Resort Website Builder — Multi-Step Google Form
 *
 * SETUP (30 seconds):
 *   1. Open https://script.google.com
 *   2. Click "New project"
 *   3. Delete the default code
 *   4. Paste everything below
 *   5. Click the Save icon (disk) — give it a name
 *   6. At the top, pick "createResortForm" from the function dropdown
 *   7. Click ▶ Run
 *   8. Accept permissions (Review permissions → choose account → Allow)
 *   9. View → Execution Log for the Form URL + Sheet URL
 */

function createResortForm() {
  // ── Create form ──────────────────────────────
  var f = FormApp.create('Port Palawan – Resort Website Builder');
  f.setDescription(
    'Fill this out to generate a complete, professional website for your resort. ' +
    'Takes about 10-15 minutes across 9 quick steps.'
  );
  f.setProgressBar(true);

  // ── Helper to add a page-break step ──────────
  function step(n, title, desc) {
    var pb = f.addPageBreakItem();
    pb.setTitle('Step ' + n + ': ' + title);
    if (desc) pb.setHelpText(desc);
    return pb;
  }

  // ══════════════════════════════════════════════
  //  STEP 1 – Basic Info
  // ══════════════════════════════════════════════
  step(1, 'Basic Info', 'Tell us about your resort.');

  f.addTextItem().setTitle('Resort Name').setRequired(true);
  f.addTextItem().setTitle('Tagline').setRequired(true);
  f.addParagraphTextItem()
    .setTitle('Short Description')
    .setHelpText('Max 200 characters — shown in search results and previews.')
    .setRequired(true)
    .getValidation()
    .withLimit(200);
  f.addParagraphTextItem()
    .setTitle('Full Description')
    .setHelpText('Your full resort story — what makes it special, history, etc.')
    .setRequired(true);

  // ══════════════════════════════════════════════
  //  STEP 2 – Media
  // ══════════════════════════════════════════════
  step(2, 'Media', 'Upload photos and video links.');

  f.addFileUploadItem()
    .setTitle('Hero Images (up to 5)')
    .setHelpText('Best wide-angle shots of your resort, beach, sunset. These become the hero carousel.')
    .setRequired(true)
    .setAcceptMimeTypes([
      FormApp.MimeType.PNG,
      FormApp.MimeType.JPEG,
      FormApp.MimeType.GIF,
      FormApp.MimeType.WEBP
    ])
    .setMaxFiles(5);

  f.addFileUploadItem()
    .setTitle('Gallery Images (up to 20)')
    .setHelpText('Rooms, amenities, food, activities, aerial shots, etc.')
    .setAcceptMimeTypes([
      FormApp.MimeType.PNG,
      FormApp.MimeType.JPEG,
      FormApp.SVG,
      FormApp.MimeType.WEBP
    ])
    .setMaxFiles(20);

  f.addTextItem()
    .setTitle('Video Tour URL (optional)')
    .setHelpText('YouTube or Vimeo link.');
    .setPlaceholder('https://www.youtube.com/watch?v=…');

  f.addFileUploadItem()
    .setTitle('Logo')
    .setHelpText('PNG with transparent background preferred.')
    .setRequired(true)
    .setAcceptMimeTypes([FormApp.MimeType.PNG, FormApp.MimeType.SVG])
    .setMaxFiles(1);

  f.addFileUploadItem()
    .setTitle('Favicon (optional)')
    .setHelpText('Small square icon for the browser tab.')
    .setAcceptMimeTypes([FormApp.MimeType.PNG, FormApp.MimeType.ICO])
    .setMaxFiles(1);

  // ══════════════════════════════════════════════
  //  STEP 3 – Amenities
  // ══════════════════════════════════════════════
  step(3, 'Amenities', 'Select everything your resort offers.');

  f.addCheckboxItem()
    .setTitle('Amenities')
    .setRequired(true)
    .setChoiceValues([
      'Beachfront',
      'Swimming Pool',
      'Restaurant',
      'Bar / Lounge',
      'Room Service',
      'Free WiFi',
      'Parking',
      'Airport Transfer',
      'Laundry Service',
      'Massage / Spa',
      'Kayaking',
      'Island Hopping',
      'Scuba Diving',
      'Snorkeling',
      'Conference Room',
      'Family Rooms',
      'Pet Friendly',
      'Wheelchair Accessible',
      '24-hour Front Desk',
      'Concierge'
    ])
    .showOtherOption(true);

  // ══════════════════════════════════════════════
  //  STEP 4 – Room Types  (repeatable, up to 6)
  // ══════════════════════════════════════════════
  step(4, 'Room Types',
    'Describe each room type (name, price, description, image URL). ' +
    'Up to 6 room types. At least one required.');

  for (var r = 1; r <= 6; r++) {
    var title = r === 1 ? 'Room Type 1 (required)' : 'Room Type ' + r + ' (optional)';
    f.addGridItem()
      .setTitle(title)
      .setRequired(r === 1)
      .setRows([
        'Room Name',
        'Price per Night (PHP)',
        'Description',
        'Image URL (optional)'
      ])
      .setColumns(['Details']);
  }

  // ══════════════════════════════════════════════
  //  STEP 5 – Location & Contact
  // ══════════════════════════════════════════════
  step(5, 'Location & Contact', 'Help guests find and reach you.');

  f.addSectionHeaderItem().setTitle('Location');

  f.addTextItem()
    .setTitle('Google Maps Link')
    .setRequired(true);

  f.addParagraphTextItem()
    .setTitle('Full Address')
    .setRequired(true);

  f.addTextItem()
    .setTitle('Nearest Airport')
    .setRequired(true);

  f.addTextItem()
    .setTitle('Distance to Town Center')
    .setHelpText('e.g. "5 minutes by tricycle" or "12 km"')
    .setRequired(true);

  f.addSectionHeaderItem().setTitle('Contact Details');

  f.addTextItem()
    .setTitle('Contact Email')
    .setRequired(true)
    .getValidation().requireTextIsEmail();
  f.addTextItem().setTitle('Phone Number').setRequired(true);
  f.addTextItem().setTitle('WhatsApp Number (optional)');
  f.addTextItem().setTitle('Facebook Page URL (optional)');
  f.addTextItem().setTitle('Instagram Handle (optional)');
  f.addTextItem().setTitle('TikTok Handle (optional)');

  // ══════════════════════════════════════════════
  //  STEP 6 – FAQ  (repeatable, up to 8)
  // ══════════════════════════════════════════════
  step(6, 'FAQ', 'Common guest questions. At least 1 required.');

  for (var faq = 1; faq <= 8; faq++) {
    var faqTitle = faq === 1 ? 'FAQ ' + faq + ' (required)' : 'FAQ ' + faq + ' (optional)';
    f.addParagraphTextItem().setTitle('Question ' + faq).setRequired(faq === 1);
    var ans = f.addParagraphTextItem().setTitle('Answer ' + faq);
    if (faq === 1) ans.setRequired(true);
  }

  // ══════════════════════════════════════════════
  //  STEP 7 – Guest Reviews  (repeatable, up to 6)
  // ══════════════════════════════════════════════
  step(7, 'Guest Reviews', 'Testimonials to display on the site. At least 1 required.');

  for (var rev = 1; rev <= 6; rev++) {
    var revTitle = rev === 1 ? 'Guest Review 1 (required)' : 'Guest Review ' + rev + ' (optional)';
    f.addGridItem()
      .setTitle(revTitle)
      .setRequired(rev === 1)
      .setRows([
        'Guest Name',
        'Review Text',
        'Rating (1–5)',
        'Date of Stay (YYYY-MM-DD)'
      ])
      .setColumns(['Details']);
  }

  // ══════════════════════════════════════════════
  //  STEP 8 – Design Preferences  (optional)
  // ══════════════════════════════════════════════
  step(8, 'Design Preferences (Optional)',
    'Customise the look. Leave blank for a beautiful default.');

  f.addTextItem()
    .setTitle('Primary Color')
    .setHelpText('Hex code like #1E88E5 or a name like "deep blue".');

  f.addListItem()
    .setTitle('Font Style')
    .setChoiceValues(['Modern', 'Classic', 'Luxury']);

  f.addListItem()
    .setTitle('Layout Style')
    .setChoiceValues(['Full Width', 'Boxed']);

  // ══════════════════════════════════════════════
  //  STEP 9 – SEO & Publishing
  // ══════════════════════════════════════════════
  step(9, 'SEO & Publishing',
    'Search-engine settings and publish preference.');

  f.addTextItem()
    .setTitle('Meta Title')
    .setHelpText('Shown in Google. Defaults to Resort Name if left blank.')
    .setRequired(true);

  f.addParagraphTextItem()
    .setTitle('Meta Description')
    .setHelpText('Shown in Google. Defaults to Short Description if left blank (150–160 chars recommended).')
    .setRequired(true);

  f.addMultipleChoiceItem()
    .setTitle('Publish Immediately?')
    .setRequired(true)
    .setChoiceValues([
      'Yes — Build and publish automatically',
      'No — Save as draft for review'
    ]);

  // Confirmation message
  f.setConfirmationMessage(
    'Thank you! Your resort data has been submitted. ' +
    'A complete website will be generated and you will receive the link shortly.'
  );

  // ── Connect a Spreadsheet ────────────────────
  Logger.log('Creating linked spreadsheet…');
  var formUrl = f.getUrl();

  // setDestination creates the default response sheet and returns its ID
  var sheetId = f.setDestination(FormApp.DestinationType.SPREADSHEET);
  var ss = SpreadsheetApp.openById(sheetId);

  // Rename the sheet tab for clarity
  ss.getActiveSheet().setName('Form Responses');

  // ── Make spreadsheet publicly viewable ───────
  ss.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

  // ── Add a trigger for new submissions ─────────
  _onFormSubmissionTrigger(f.getId());

  // ── Log results ──────────────────────────────
  Logger.log('========================================');
  Logger.log('FORM CREATED');
  Logger.log('Form URL : ' + formUrl);
  Logger.log('Sheet URL: ' + ss.getUrl());
  Logger.log('========================================');

  return { formUrl: formUrl, sheetUrl: ss.getUrl() };
}

/**
 * Installs a form-submit trigger so we can watch for new entries.
 */
function _onFormSubmissionTrigger(formId) {
  // Remove any existing trigger
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === '_handleFormSubmit') {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }

  ScriptApp.newTrigger('_handleFormSubmit')
    .forForm(formId)
    .onFormSubmit()
    .create();

  Logger.log('Form-submit trigger installed ✓');
}

/**
 * Fires on every new submission.
 * Logs the full response data in structured JSON.
 * TODO: wire this to your website-building pipeline.
 */
function _handleFormSubmit(e) {
  if (!e) {
    Logger.log('WARN: no event object — test this via form submission, not IDE.');
    return;
  }

  var responses = e.response;
  if (!responses) {
    Logger.log('WARN: no response object.');
    return;
  }

  var items = responses.getItemResponses();
  var data = {};
  for (var i = 0; i < items.length; i++) {
    data[items[i].getItem().getTitle()] = items[i].getResponse();
  }

  Logger.log('New submission (JSON): ' + JSON.stringify(data, null, 2));

  // TODO POST: call your builder API / webhook here to auto-generate the site.
  // Example: UrlFetchApp.fetch('YOUR_WEBHOOK_URL', {
  //   method: 'post',
  //   contentType: 'application/json',
  //   payload: JSON.stringify(data)
  // });
}
