const fs = require('fs');
const file = 'backend/backapp/src/main/java/com/matching/backapp/controller/DummyDataController.java';
let java = fs.readFileSync(file, 'utf8');

// The error is: traitsMap.put(TRAITS_IDEAL[random.nextInt(TRAITS_IDEAL.length)], random.nextInt(101));
// It seems there's a leftover loop or put statement for TRAITS_IDEAL.
// Let's replace it with TRAITS_ROMANCE or just remove it if ROMANCE is already there.

if (java.includes('TRAITS_IDEAL')) {
    // If TRAITS_ROMANCE is already there, we can just remove the IDEAL line.
    if (java.includes('traitsMap.put(TRAITS_ROMANCE')) {
        java = java.replace(/traitsMap\.put\(TRAITS_IDEAL\[random\.nextInt\(TRAITS_IDEAL\.length\)\], random\.nextInt\(101\)\);/g, '');
    } else {
        // Replace IDEAL with ROMANCE
        java = java.replace(/TRAITS_IDEAL/g, 'TRAITS_ROMANCE');
    }
}

fs.writeFileSync(file, java, 'utf8');
