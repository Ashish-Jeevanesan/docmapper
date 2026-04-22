# DocuMapper

<div align="center">
<img width="100%" alt="DocuMapper Banner" src="assets/banner.png" />
</div>

**DocuMapper** is a powerful, interactive visual utility designed to bridge the gap between unstructured document layouts and structured data extraction. By providing a clean interface over high-resolution document previews, it allows engineering, data entry, and implementation teams to visually map coordinates across templates—greatly speeding up the setup process for automated intelligent document processing or Jasper reporting schemas.

## Why DocuMapper?

When setting up automated pipelines for reading PDFs, invoices, forms, or legacy templates, developers often waste countless hours manually guessing pixel coordinates to slice data from pages.

DocuMapper completely automates this setup visually. You simply upload a sample document, draw boxes over the data fragments you care about, assign backend database columns to those boxes, and instantly output a robust, ready-to-use JSON Schema configuration map.

## Core Features

- 🎯 **Interactive Document Canvas**: Navigate through dense, large-scale documents with ease using smooth pan and zoom tools designed to mimic high-end design software.
- 📐 **Visual Mapping Engine**: Click and drag to create responsive mapping targets. Draw, resize, and reposition mapping boundaries globally with absolute percentage precision, making the mappings compatible with varied rendering resolutions.
- 🔒 **Schema Locking**: Guarantee precision by locking exact mapping coordinates to prevent accidental edits, saving work mid-flight.
- 💾 **Instant JSON Export/Import**: Download mapping results instantly as a clean JSON schema perfect for downstream pipelines. Need to hand the work off to another team? Forward the JSON and have them upload it back into their own DocuMapper dashboard to pick up exactly where you left off. 

## How to Use DocuMapper

1. **Upload or Import**: Start by uploading a sample document (PNG, JPG, PDF-rendered images) using the central upload box, or click "Import JSON" in the top bar to resume an existing mapping session.
2. **Navigation**: Use the pan tool (Hand icon) to drag around large documents, and the `+` or `-` buttons to zoom in and out for a better view.
3. **Draw Mappings**: Switch to Map mode (Cursor icon). Click anywhere on the document canvas to drop a new mapping box. Drag the box borders or the bottom right corner to resize it precisely over the required data field.
4. **Configure Fields**: Once a box is selected, hop over to the right-hand **Field Configuration** panel. Assign a human-readable display label, define the exact backend target data column name, and add any specific business logic or formatting instructions.
5. **Lock Values**: To prevent accidental shifting while placing other fields, click the **Lock** icon inside the configuration panel. This secures the mapping box in place.
6. **Export Schema**: Finally, hit the **Export Jasper JSON** button to review your payload, or click **Apply Mapping Schema** to instantly download the `.json` structure for your data pipelines.

## Who is this for?

- **Data Engineers** building OCR pipelines.
- **Jasper Reporting teams** designing new data generation layers.
- **Product Managers** defining strict parsing configurations for external forms.

---

> **Looking for development specifics?** Check out the [Technical Details Guide](technical_details.md) to dive into the React architectural makeup, environment setups, and build commands.
