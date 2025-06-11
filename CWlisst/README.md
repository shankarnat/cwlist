# Content Lens Manager for Salesforce

This application is designed to work within Salesforce as a Visualforce page with CORS support.

## Setup Instructions

1. **Upload JavaScript as Static Resource:**
   - Go to Setup → Static Resources
   - Create new Static Resource named "ContentLensJS"
   - Upload the `ContentLens.js` file
   - Set Cache Control to "Public"

2. **Deploy Apex Controller:**
   - Deploy `ContentLensController.cls` with its meta.xml file

3. **Deploy Visualforce Page:**
   - Deploy `ContentLensManager.page` with its meta.xml file

4. **Create a Tab:**
   - Go to Setup → Tabs
   - Create new Visualforce Tab
   - Select "ContentLensManager" page
   - Choose appropriate icon and label

## CORS Configuration

The app is designed to work within Salesforce's security model:
- Uses Visualforce Remoting for secure server communication
- No external API calls that would trigger CORS issues
- All resources loaded from Salesforce (SLDS, Static Resources)

## Features

- Search and filter lenses
- Create new lenses with modal dialog
- Clone selected lenses
- Refresh to load pending changes
- Responsive SLDS design
- Works in both Classic and Lightning Experience

## Navigation Handling

The app detects the Salesforce context and uses appropriate navigation:
- Lightning Experience: Uses `sforce.one.navigateToURL`
- Classic: Updates parent window location
- Standalone: Direct window navigation