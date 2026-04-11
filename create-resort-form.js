/**
 * Resort Website Builder - Google Apps Script
 * 
 * SETUP:
 * 1. Go to https://script.google.com
 * 2. Click "New Project"
 * 3. Replace all code with this script
 * 4. Click Save (disk icon)
 * 5. Click Run → createResortForm()
 * 6. Accept all permissions
 * 7. Check View → Executions for the Form + Sheet URLs
 */

function createResortForm() {
  // ─── Create Form ───
  var form = FormApp.create('Port Palawan — Resort Website Builder');
  form.setTitle('Resort Website Builder');
  form.setDescription('Complete this form to generate a professional website for your resort. All 9 steps take about 10-15 minutes.');
  form.setProgressBar(true);
  form.setCollectEmail(true);
  form.setConfirmationMessage('Thank you! Your resort data has been submitted. We will build your website and notify you when it is live.');

  // ════════════════════════════════════════════
  // STEP 1: Basic Info
  // ════════════════════════════════════════════
  form.addPageBreakItem()
    .setTitle('Step 1 of 9: Basic Information')
    .setHelpText('Give us the basics about your resort.');

  form.addTextItem()
    .setTitle('Resort Name')
    .setRequired(true)
    .setPlaceholder('e.g., Port Barton Beach Resort');

  form.addTextItem()
    .setTitle('Tagline')
    .setRequired(true)
    .setPlaceholder('e.g., Your Paradise in Palawan');

  form.addParagraphTextItem()
    .setTitle('Short Description')
    .setRequired(true)
    .setHelpText('Maximum 200 characters. This will be used for SEO and previews.')
    .setPlaceholder('A beautiful beachfront resort with crystal clear waters...');

  form.addParagraphTextItem()
    .setTitle('Full Description')
    .setRequired(true)
    .setPlaceholder('Tell guests about your resort, its history, what makes it special...');

  // ════════════════════════════════════════════
  // STEP 2: Media
  // ════════════════════════════════════════════
  form.addPageBreakItem()
    .setTitle('Step 2 of 9: Media & Branding')
    .setHelpText('Upload images and provide media links. Higher quality photos = better website!');

  form.addFileUploadItem()
    .setTitle('Hero Images (2-5 recommended)')
    .setRequired(true)
    .setHelpText('Your best, highest-quality photos. These become the main banner/carousel.')
    .setAcceptMimeTypes([
      FormApp.MimeType.PNG,
      FormApp.MimeType.JPEG,
      FormApp.MimeType.GIF
    ])
    .setMaxFiles(5);

  form.addFileUploadItem()
    .setTitle('Gallery Images (up to 20)')
    .setHelpText('Rooms, beach, activities, food, sunset, etc. More is better!')
    .setAcceptMimeTypes([
      FormApp.MimeType.PNG,
      FormApp.MimeType.JPEG,
      FormApp.MimeType.GIF
    ])
    .setMaxFiles(20);

  form.addTextItem()
    .setTitle('Video Tour URL (optional)')
    .setHelpText('YouTube or Vimeo link to a walkthrough or promo video.')
    .setPlaceholder('https://youtube.com/watch?v=...');

  form.addFileUploadItem()
    .setTitle('Logo Image')
    .setRequired(true)
    .setHelpText('PNG with transparent background preferred. At least 200px wide.')
    .setAcceptMimeTypes([
      FormApp.MimeType.PNG,
      FormApp.MimeType.SVG,
      FormApp.MimeType.JPEG
    ])
    .setMaxFiles(1);

  form.addFileUploadItem()
    .setTitle('Favicon (optional)')
    .setHelpText('Small icon for the browser tab. 32x32px PNG.')
    .setAcceptMimeTypes([
      FormApp.MimeType.PNG
    ])
    .setMaxFiles(1);

  // ════════════════════════════════════════════
  // STEP 3: Amenities
  // ════════════════════════════════════════════
  form.addPageBreakItem()
    .setTitle('Step 3 of 9: Amenities')
    .setHelpText('Select all amenities available at your resort.');

  form.addCheckboxItem()
    .setTitle('Select all that apply:')
    .setRequired(true)
    .showOtherOption(true)
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
    ]);

  // ════════════════════════════════════════════
  // STEP 4: Room Types
  // ════════════════════════════════════════════
  form.addPageBreakItem()
    .setTitle('Step 4 of 9: Room Types')
    .setHelpText('Describe your room categories. You can add up to 6 room types.');

  var room1 = form.addGridItem()
    .setTitle('Room Type 1')
    .setRequired(true)
    .setRows(['Room Name', 'Price per Night (PHP)', 'Description', 'Room Image URL (if available)'])
    .setColumns(['Details']);

  for (var i = 2; i <= 6; i++) {
    form.addGridItem()
      .setTitle('Room Type ' + i + ' (optional)')
      .setRows(['Room Name', 'Price per Night (PHP)', 'Description', 'Room Image URL (if available)'])
      .setColumns(['Details']);
  }

  // ════════════════════════════════════════════
  // STEP 5: Location & Contact
  // ════════════════════════════════════════════
  form.addPageBreakItem()
    .setTitle('Step 5 of 9: Location & Contact')
    .setHelpText('Help guests find and reach you.');

  form.addSectionHeaderItem()
    .setTitle('Location')
    .setHelpText('Where is your resort?');

  form.addTextItem()
    .setTitle('Google Maps Link')
    .setRequired(true)
    .setPlaceholder('https://maps.google.com/...');

  form.addParagraphTextItem()
    .setTitle('Full Address')
    .setRequired(true)
    .setPlaceholder('Barangay, Municipality, Province, ZIP Code');

  form.addTextItem()
    .setTitle('Nearest Airport')
    .setRequired(true)
    .setPlaceholder('e.g., Puerto Princesa International Airport');

  form.addTextItem()
    .setTitle('Distance to Town Center')
    .setRequired(true)
    .setPlaceholder('e.g., 5 minutes by tricycle');

  form.addSectionHeaderItem()
    .setTitle('Contact & Social Media');

  form.addTextItem()
    .setTitle('Contact Email')
    .setRequired(true)
    .setPlaceholder('info@yourresort.com');

  form.addTextItem()
    .setTitle('Phone Number')
    .setRequired(true)
    .setPlaceholder('+63 XXX XXX XXXX');

  form.addTextItem()
    .setTitle('WhatsApp Number (optional)')
    .setPlaceholder('+63 XXX XXX XXXX');

  form.addTextItem()
    .setTitle('Facebook Page URL (optional)')
    .setPlaceholder('https://facebook.com/yourpage');

  form.addTextItem()
    .setTitle('Instagram Handle (optional)')
    .setPlaceholder('@yourresort');

  form.addTextItem()
    .setTitle('TikTok Handle (optional)')
    .setPlaceholder('@yourresort');

  // ════════════════════════════════════════════
  // STEP 6: FAQ
  // ════════════════════════════════════════════
  form.addPageBreakItem()
    .setTitle('Step 6 of 9: Frequently Asked Questions')
    .setHelpText('What do guests commonly ask? Add up to 8 FAQs. At least one is required.');

  var faq1 = form.addSectionHeaderItem()
    .setTitle('FAQ 1 (required)');

  faq1.setTitle('Frequently Asked Questions');

  form.addParagraphTextItem()
    .setTitle('Question 1')
    .setRequired(true)
    .setPlaceholder('e.g., What is the check-in time?');

  form.addParagraphTextItem()
    .setTitle('Answer 1')
    .setRequired(true)
    .setPlaceholder('e.g., Check-in is at 2:00 PM. Early check-in may be available upon request.');

  for (var j = 2; j <= 8; j++) {
    form.addParagraphTextItem()
      .setTitle('Question ' + j + ' (optional)')
      .setPlaceholder('Another common question guests ask...');

    form.addParagraphTextItem()
      .setTitle('Answer ' + j)
      .setPlaceholder('Your answer here...');
  }

  // ════════════════════════════════════════════
  // STEP 7: Guest Reviews
  // ════════════════════════════════════════════
  form.addPageBreakItem()
    .setTitle('Step 7 of 9: Guest Reviews')
    .setHelpText('Share 1-6 recent guest reviews to display on your site. At least one is required.');

  var review = form.addGridItem()
    .setTitle('Guest Review 1')
    .setRequired(true)
    .setRows(['Guest Name', 'Review Text', 'Rating (1-5)', 'Date of Stay'])
    .setColumns(['Details']);

  for (var k = 2; k <= 6; k++) {
    form.addGridItem()
      .setTitle('Guest Review ' + k + ' (optional)')
      .setRows(['Guest Name', 'Review Text', 'Rating (1-5)', 'Date of Stay'])
      .setColumns(['Details']);
  }

  // ════════════════════════════════════════════
  // STEP 8: Design Preferences (Optional)
  // ════════════════════════════════════════════
  form.addPageBreakItem()
    .setTitle('Step 8 of 9: Design Preferences (Optional)')
    .setHelpText('Customize the look. Leave blank for default beautiful design.');

  form.addTextItem()
    .setTitle('Primary Color')
    .setHelpText('A hex color code or name. This will be the main color of your site. Leave blank for default blue.')
    .setPlaceholder('#1E88E5 or "deep blue"');

  form.addListItem()
    .setTitle('Font Style')
    .setHelpText('This controls the typography of your website.')
    .setChoices([
      form.createChoice('Modern - Clean and contemporary'),
      form.createChoice('Classic - Traditional and elegant'),
      form.createChoice('Luxury - Sophisticated and high-end')
    ]);

  form.addListItem()
    .setTitle('Layout Style')
    .setChoices([
      form.createChoice('Full Width - Content spans the entire screen'),
      form.createChoice('Boxed - Centered content with elegant margins')
    ]);

  // ════════════════════════════════════════════
  // STEP 9: SEO & Publishing
  // ════════════════════════════════════════════
  form.addPageBreakItem()
    .setTitle('Step 9 of 9: SEO & Publishing')
    .setHelpText('Final settings for search engines and publishing.');

  form.addTextItem()
    .setTitle('Meta Title for Search Engines')
    .setRequired(true)
    .setHelpText('This is what shows in Google search results. Default: your resort name.')
    .setPlaceholder('Port Barton Beach Resort | Best Beachfront Stay in Palawan');

  form.addParagraphTextItem()
    .setTitle('Meta Description for Search Engines')
    .setRequired(true)
    .setHelpText('Short description shown in Google search results. 150-160 characters recommended.')
    .setPlaceholder('Experience paradise at our beachfront resort...');

  form.addMultipleChoiceItem()
    .setTitle('Publish Immediately?')
    .setRequired(true)
    .setChoices([
      form.createChoice('Yes — Build and publish automatically'),
      form.createChoice('No — Save as draft for my review first')
    ]);

  // ════════════════════════════════════════════
  // Create & Connect Spreadsheet
  // ════════════════════════════════════════════
  var formUrl = form.getUrl();
  
  // Connect to a Google Sheet
  var sheetTitle = 'Resort Submissions - ' + new Date().toLocaleDateString();
  var ss = SpreadsheetApp.create(sheetTitle);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  
  // Make the sheet publicly viewable
  ss.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  
  var sheetUrl = ss.getUrl();
  
  Logger.log('========== FORM CREATED ==========');
  Logger.log('Form URL: ' + formUrl);
  Logger.log('Sheet URL: ' + sheetUrl);
  Logger.log('==================================');
  
  // Also add an Apps Script trigger to watch for new submissions
  createFormSubmissionTrigger(form.getId());
  
  return {
    formUrl: formUrl,
    spreadsheetUrl: sheetUrl,
    formId: form.getId()
  };
}

/**
 * Creates a trigger that fires when someone submits the form
 */
function createFormSubmissionTrigger(formId) {
  // Delete existing triggers
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Create new form submit trigger
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(formId)
    .onFormSubmit()
    .create();
      
  Logger.log('Form submission trigger created!');
}

/**
 * Runs when someone submits the form
 * This collects all the data into a structured JSON format
 * ready for the website building pipeline
 */
function onFormSubmit(e) {
  // This will be called by Google Apps Script when a form is submitted
  // The data will be processed and a website will be built
  
  var form = FormApp.getActiveForm();
  var responses = form.getResponses();
  var latestResponse = responses[responses.length - 1];
  var itemResponses = latestResponse.getItemResponses();
  
  var resortData = {};
  
  // Map the form items to structured data
  for (var i = 0; i < itemResponses.length; i++) {
    var item = itemResponses[i];
    var title = item.getItem().getTitle();
    var response = item.getResponse();
    
    // Map to the site builder data structure
    if (title === 'Resort Name') {
      resortData.site_name = response;
    } else if (title === 'Tagline') {
      resortData.tagline = response;
    } else if (title === 'Short Description') {
      resortData.shortDescription = response;
    } else if (title === 'Full Description') {
      resortData.fullDescription = response;
    } else if (title === 'Hero Images (2-5 recommended)') {
      resortData.heroImages = response; // File IDs from Drive
    } else if (title === 'Gallery Images (up to 20)') {
      resortData.galleryImages = response; // File IDs from Drive
    } else if (title === 'Video Tour URL (optional)') {
      resortData.videoUrl = response;
    } else if (title === 'Logo Image') {
      resortData.logo = response; // File ID from Drive
    } else if (title === 'Favicon (optional)') {
      resortData.favicon = response;
    } else if (title === 'Select all that apply:') {
      resortData.amenities = response;
    }
    // ... continue mapping all fields
  }
  
  // Log the data for now
  Logger.log('New resort submission: ' + JSON.stringify(resortData));
  
  // TODO: Call the website builder API
  // This is where we'd call a webhook to build the site
  // buildWebsiteFromResortData(resortData);
}
