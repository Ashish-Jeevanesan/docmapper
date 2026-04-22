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

## 5. Mobile-First Accessibility & Touch UI
While document mapping is traditionally a desktop-heavy task, supporting mobile users opens the door for quick, on-the-go schema approvals and field adjustments from a smartphone. 

### Mobile Design Plan
Implementing a mobile-friendly architecture will require solving standard viewport constraints and touch-accuracy challenges:
- **Event Engine Migration**: Upgrade the current `mousedown`/`mousemove` hardware engine to support raw `touchstart` and `touchmove` events for seamless finger-dragging across the canvas.
- **Collapsible UI Architecture**: The current right-hand configuration panel will be refactored into a **Bottom Sheet / Drawer View** that slides up when a mapped box is double-tapped, preserving maximum screen real-estate for the document itself.
- **Magnifying Loupe**: Because human fingers obscure coordinate precision while dragging, a dynamic "Magnifying Loupe" sphere should render *above* the user's touch point. This will display a 200% zoomed sub-view of the box corner they are dragging, allowing for pixel-perfect edge alignment on small tactile screens.
- **Pinch-to-Zoom Engine**: Integrating two-finger pinch gesture detection to interact directly with the React `zoom` state layer smoothly.
