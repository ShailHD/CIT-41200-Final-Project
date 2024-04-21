const express = require('express');
const multer = require('multer');
const { Firestore } = require('@google-cloud/firestore');
const { parse: parsePDF } = require('pdf-parse');
const { BigQuery } = require('@google-cloud/bigquery');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const firestore = new Firestore();
const bigquery = new BigQuery();

app.use(express.static('public')); // Serve static files

// Function to insert data into BigQuery
async function insertIntoBigQuery(data) {
    const datasetId = 'CreditTracking';
    const tableId = 'Vehicles';
    const rows = [data];

    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);

    try {
        await table.insert(rows);
        console.log(`Inserted data into BigQuery: ${JSON.stringify(rows)}`);
    } catch (error) {
        console.error('Error inserting data into BigQuery:', error);
        // Handle the error appropriately in a real application
    }
}

// Function to extract details from PDF text
async function extractDetailsFromPDF(text) {
    // Placeholder for the extracted data
    let extractedData = {
        manufacturer: '',
        model: '',
        vin: '',
        countryOfOrigin: '',
        price: 0,
        batterySupplier: '',
        electricMotorSupplier: '',
        chassisSupplier: '',
        batteryManufacturingLocation: '',
        typeOfBattery: '',
        lithiumSource: '',
        nickelSource: '',
        criticalMinerals: [],
        countriesOfMineralOrigin: [],
        manufacturingCoordinates: { latitude: 0, longitude: 0 },
        barcodeID: ''
    };

    // Split the text into lines for easier processing
    const lines = text.split('\n');

    // Extract the information line by line
    lines.forEach(line => {
        if (line.startsWith('Make:')) {
            const parts = line.split('  '); // Two spaces based on the PDF structure
            extractedData.manufacturer = parts[0].split(': ')[1];
            extractedData.model = parts[1].split(': ')[1];
        } else if (line.startsWith('VIN:')) {
            extractedData.vin = line.split(': ')[1];
        } else if (line.startsWith('Country of Origin:')) {
            extractedData.countryOfOrigin = line.split(': ')[1];
        } else if (line.startsWith('Price:')) {
            extractedData.price = parseInt(line.split(': $')[1].replace(',', ''), 10);
        } else if (line.startsWith('Battery Supplier:')) {
            extractedData.batterySupplier = line.split(': ')[1];
        } else if (line.startsWith('Electric Motor Supplier:')) {
            extractedData.electricMotorSupplier = line.split(': ')[1];
        } else if (line.startsWith('Chassis Supplier:')) {
            extractedData.chassisSupplier = line.split(': ')[1];
        } else if (line.startsWith('Location:')) {
            extractedData.batteryManufacturingLocation = line.split(': ')[1];
        } else if (line.startsWith('Type of Battery:')) {
            extractedData.typeOfBattery = line.split(': ')[1];
        } else if (line.startsWith('Lithium:')) {
            extractedData.lithiumSource = line.split(': ')[1];
        } else if (line.startsWith('Nickel:')) {
            extractedData.nickelSource = line.split(': ')[1];
        } else if (line.startsWith('Critical Minerals Used:')) {
            extractedData.criticalMinerals = line.split(': ')[1].split(', ');
        } else if (line.startsWith('Countries of Mineral Origin:')) {
            extractedData.countriesOfMineralOrigin = line.split(': ')[1].split(', ');
        } else if (line.startsWith('Latitude:')) {
            const parts = line.split('  '); // Two spaces based on the PDF structure
            extractedData.manufacturingCoordinates.latitude = parseFloat(parts[0].split(': ')[1]);
            extractedData.manufacturingCoordinates.longitude = parseFloat(parts[1].split(': ')[1]);
        } else if (!isNaN(line) && line.length >= 10) { // Assuming the barcode is a numeric string of at least 10 digits
            extractedData.barcodeID = line.trim();
        }
    });

    return extractedData;

}

// Function to evaluate tax credit eligibility
function evaluateEligibility(details) {
    // Assume 'North America' is the compliant region for assembly and sourcing
    const compliantRegions = ['United States', 'Canada', 'Mexico'];
    const isAssemblyCompliant = compliantRegions.includes(details.countryOfOrigin);

    // Tax Credit Eligibility Logic
    const isSourcingCompliant = true; // Simulated compliance check

    return {
        eligibility: isAssemblyCompliant && isSourcingCompliant ? 'Eligible for $7,500 tax credit' : 'Not eligible',
        reasons: isAssemblyCompliant && isSourcingCompliant ? ['Assembly and sourcing from North America'] : []
    };
}

// Function to insert data into Firestore
async function insertIntoFirestore(data) {
    try {
        const documentRef = firestore.collection('default').doc();
        await documentRef.set(data);
        console.log('Data insertion to Firestore was successful');
    } catch (error) {
        console.error('Error inserting data into Firestore:', error);
        throw error; // Throw the error to handle it in the calling function
    }

}

// Express route to handle file upload and processing
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const pdfBuffer = req.file.buffer;
        const data = await parsePDF(pdfBuffer);
        const extractedData = await extractDetailsFromPDF(data.text);
        const eligibilityDetails = evaluateEligibility(extractedData);
        const dataToInsert = {
            ...extractedData,
            ...eligibilityDetails
        };
        await insertIntoFirestore(dataToInsert);
        await insertIntoBigQuery(dataToInsert); // Insert into BigQuery
        res.redirect('/summary');
    } catch (error) {
        console.error('Error processing the file:', error);
        res.status(500).send('An error occurred while processing the file.');
    }
});

// Route to handle moving to the next page and sending data to Firestore and BigQuery
app.post('/submit-summary', async (req, res) => {
    try {
        const data = req.body;
        await insertIntoFirestore(data);
        await insertIntoBigQuery(data); // Insert into BigQuery
        res.redirect('/result');
    } catch (error) {
        console.error('Error on submitting summary:', error);
        res.status(500).send('An error occurred.');
    }
});

// Existing app.use() middleware
app.use(express.static('public')); // Serve static files

// Add this route to serve index.html at the root
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// Start the server
// Start the server on port 3000
app.listen(8080, () => {
    console.log('Server started on port 8080');
});
