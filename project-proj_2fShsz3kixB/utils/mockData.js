const PORTS = [
    "Shanghai", "Ningbo", "Shenzhen", "Guangzhou", "Qingdao", "Tianjin", "Xiamen", // China
    "Los Angeles", "Long Beach", "New York", "Rotterdam", "Hamburg", "Antwerp", "Singapore", "Busan", "Dubai"
];

const CARRIERS = ["Maersk", "MSC", "CMA CGM", "COSCO", "Hapag-Lloyd", "ONE", "Evergreen"];

const CONTAINER_TYPES = ["20GP", "40GP", "40HQ", "45HQ"];

function generateFreightData(count = 50) {
    const data = [];
    for (let i = 0; i < count; i++) {
        const origin = PORTS[Math.floor(Math.random() * 7)]; // Mostly China origins
        const dest = PORTS[7 + Math.floor(Math.random() * (PORTS.length - 7))];
        const price = 500 + Math.floor(Math.random() * 4500); // $500 - $5000
        const carrier = CARRIERS[Math.floor(Math.random() * CARRIERS.length)];
        
        // Random dates
        const today = new Date();
        const cutoff = new Date(today);
        cutoff.setDate(today.getDate() + Math.floor(Math.random() * 14));
        
        const eta = new Date(cutoff);
        eta.setDate(cutoff.getDate() + 15 + Math.floor(Math.random() * 30));

        const validUntil = new Date(today);
        validUntil.setDate(today.getDate() + 7);

        const surchargesList = [
            "THC: ¥1150, DOC: ¥500, SEAL: ¥50",
            "THC: ¥1200, DOC: ¥450, SEAL: ¥40, LSS: $15",
            "ALL IN (含双边附加费)",
            "THC: ¥1100, DOC: ¥500, SEAL: ¥50, EIR: ¥50",
            "ORC: $140, DOC: ¥500, SEAL: ¥50"
        ];
        const surcharges = surchargesList[Math.floor(Math.random() * surchargesList.length)];

        data.push({
            id: `FR-${10000 + i}`,
            origin,
            destination: dest,
            surcharges,
            price, // USD
            currency: "USD",
            containerType: CONTAINER_TYPES[Math.floor(Math.random() * CONTAINER_TYPES.length)],
            volume: Math.floor(Math.random() * 10), // Quantity (0-9, allowing 0 for sold out)
            carrier,
            cutoffDate: cutoff.toISOString().split('T')[0],
            eta: eta.toISOString().split('T')[0],
            validUntil: validUntil.toISOString().split('T')[0],
            provider: `User_${Math.floor(Math.random() * 9000) + 1000}`,
            providerContact: `+86 138 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000)}`
        });
    }
    // Sort by price low to high
    return data.sort((a, b) => a.price - b.price);
}

const MOCK_FREIGHT_DATA = generateFreightData(100);