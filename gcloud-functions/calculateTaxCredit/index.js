const functions = require('firebase-functions');

exports.calculateTaxCredit = functions.https.onRequest((req, res) => {
    const data = req.body;

    // Basic validation
    if (!data.countryOfOrigin || !data.criticalMinerals || !data.batteryManufacturingLocation) {
        return res.status(400).send('Missing data');
    }

    const compliantCountries = ['United States', 'Canada', 'Mexico'];
    const isEligibleForCredit = compliantCountries.includes(data.countryOfOrigin) &&
                                compliantCountries.includes(data.batteryManufacturingLocation) &&
                                data.criticalMinerals.every(mineral => compliantCountries.includes(mineral));

    res.send({
        eligibility: isEligibleForCredit,
        creditAmount: isEligibleForCredit ? 7500 : 0,
        message: isEligibleForCredit ? 'Eligible for full tax credit' : 'Not eligible for tax credit'
    });
});
