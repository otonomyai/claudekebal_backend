import fs from 'fs/promises';
import { parseString } from 'xml2js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract title and description from XML
function extractFromXML(xmlPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(xmlPath, 'utf8')
            .then(xmlData => {
                parseString(xmlData, (err, result) => {
                    if (err) reject(err);
                    else {
                        console.log('XML Structure:', JSON.stringify(result, null, 2));
                        
                        let title = 'Title not found';
                        let description = 'Description not found';
                        
                        // Try to find title and description
                        if (result['us-patent-application']) {
                            title = result['us-patent-application']['us-bibliographic-data-application'][0]['invention-title'][0]['_'];
                            description = result['us-patent-application']['abstract'][0]['p'][0];
                        } else if (result['us-patent-grant']) {
                            title = result['us-patent-grant']['us-bibliographic-data-grant'][0]['invention-title'][0]['_'];
                            description = result['us-patent-grant']['abstract'][0]['p'][0];
                        }
                        
                        resolve({ title, description });
                    }
                });
            })
            .catch(reject);
    });
}

// Function to process each patent
async function processPatent(patent) {
    try {
        const { title, description } = await extractFromXML(patent.xmlPath);
        
        return {
            patentNumber: patent.patentNumber,
            title,
            description,
            images: patent.images.map(imagePath => {
                const newImagePath = path.join('textandimage', path.basename(imagePath).replace('.TIF', '.png'));
                return newImagePath;
            })
        };
    } catch (error) {
        console.error(`Error processing patent ${patent.patentNumber}:`, error);
        return null;
    }
}

// Main function
async function main() {
    // Read the original metadata
    const metadata = JSON.parse(await fs.readFile('metadata.json', 'utf8'));
    
    // Create the new directory
    try {
        await fs.mkdir('textandimage');
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
    
    // Process each patent
    const newMetadata = await Promise.all(metadata.map(processPatent));
    
    // Filter out null values (failed processing)
    const filteredMetadata = newMetadata.filter(item => item !== null);
    
    // Write the new metadata to a file
    await fs.writeFile('textandimage/metadata.json', JSON.stringify(filteredMetadata, null, 2));
    
    console.log('Processing complete. New metadata saved in textandimage/metadata.json');
}

main().catch(console.error);