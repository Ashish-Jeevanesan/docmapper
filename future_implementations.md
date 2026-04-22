# DocuMapper: Future Implementations & SaaS Roadmap

While DocuMapper currently operates as an exceptionally fast, pure-frontend utility for technical teams to define mapping schemas, transforming it into a fully-fledged commercial SaaS platform would involve building out several backend mechanics.

Below is the conceptual roadmap for the evolution of DocuMapper.

## 1. True Multi-Page PDF Ingestion
Currently, the application relies on static image uploads (`image/png`, `image/jpeg`). 
Since enterprise business workflows heavily revolve around PDFs, the first major structural change would be integrating a library like `pdf.js`. This would allow users to upload 100-page invoices, natively render those pages to the canvas background buffer, and apply mappings that securely anchor to specific document pages.

## 2. Cloud Accounts and Schema Warehousing
The current workflow requires exporting and importing local `.json` schemas to save state.
A commercial product needs a native database backend (e.g., PostgreSQL via Supabase or Firebase). 
- **User Authentication**: Organizations can create accounts and workspaces.
- **Template Library**: Teams would have a dynamic dashboard of saved layouts (e.g., "Vendor X Invoice Template", "HR Form Template") stored in the cloud, allowing them to click and load templates instantly without tossing JSON files.

## 3. Live OCR Validation (The Magic Factor)
The most valuable feature for a mapping tool is proving to the user that the map *works*.
By integrating an OCR vision backend (such as AWS Textract, Google Gemini Vision, or Azure Document Intelligence), DocuMapper could instantly validate coordinates. 
When a user draws a box over a column on an invoice, a hovering tooltip would query the backend with those exact coordinate bounds and instantly display the extracted text (e.g., "$4,500.00"). This creates high confidence that the JSON schema being built will succeed correctly in the actual automated pipeline.

## 4. Webhook & API Integrations
Instead of just downloading the resulting JSON schema, a "Deploy Schema" button could POST the structure directly to a customer's production endpoints or intelligent document processing layer.
