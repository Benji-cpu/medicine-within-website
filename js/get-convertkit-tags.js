/**
 * Helper script to retrieve ConvertKit Tag IDs
 * 
 * Usage:
 * 1. Open browser console on any page that loads config.js
 * 2. Copy and paste this entire script
 * 3. Replace YOUR_API_SECRET with your ConvertKit API Secret (not the public key)
 * 4. Run: getConvertKitTags('YOUR_API_SECRET')
 * 
 * OR run in Node.js:
 * node get-convertkit-tags.js YOUR_API_SECRET
 */

async function getConvertKitTags(apiSecret) {
    if (!apiSecret) {
        console.error('❌ API Secret required. Get it from: ConvertKit → Settings → Advanced → API Secret');
        return;
    }

    try {
        const url = `https://api.convertkit.com/v3/tags?api_secret=${apiSecret}`;
        console.log('🔍 Fetching tags from ConvertKit...');
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch tags');
        }
        
        if (data.tags && data.tags.length > 0) {
            console.log('\n✅ Found tags:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            const targetTags = [
                'general-newsletter',
                'temple-interest', 
                'retreats-waitlist',
                'kambo-interest'
            ];
            
            const foundTags = {};
            
            data.tags.forEach(tag => {
                const isTarget = targetTags.some(target => 
                    tag.name.toLowerCase().includes(target.replace('-', '')) ||
                    tag.name.toLowerCase().includes(target)
                );
                
                if (isTarget) {
                    foundTags[tag.name] = tag.id;
                    console.log(`📌 ${tag.name}: ${tag.id}`);
                }
            });
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n📋 Copy this into config.js:');
            console.log('\ntags: {');
            
            // Map tag names to config keys
            const tagMapping = {
                'general-newsletter': 'general',
                'temple-interest': 'temple',
                'retreats-waitlist': 'retreats',
                'kambo-interest': 'kambo'
            };
            
            Object.entries(foundTags).forEach(([name, id]) => {
                const configKey = Object.keys(tagMapping).find(key => 
                    name.toLowerCase().includes(key.replace('-', ''))
                );
                if (configKey) {
                    console.log(`    ${tagMapping[configKey]}: '${id}',      // ${name}`);
                }
            });
            
            console.log('}');
            
            return foundTags;
        } else {
            console.log('⚠️  No tags found in your ConvertKit account');
        }
    } catch (error) {
        console.error('❌ Error fetching tags:', error.message);
        console.log('\n💡 Alternative: Get tag IDs manually from ConvertKit dashboard:');
        console.log('   1. Go to Subscribers → Tags');
        console.log('   2. Click on each tag');
        console.log('   3. Check URL for subscribable_ids parameter');
    }
}

// If running in browser console
if (typeof window !== 'undefined') {
    window.getConvertKitTags = getConvertKitTags;
    console.log('✅ Helper function loaded! Run: getConvertKitTags("YOUR_API_SECRET")');
}

// If running in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = getConvertKitTags;
    
    // Auto-run if API secret provided as argument
    if (process.argv.length > 2) {
        getConvertKitTags(process.argv[2]);
    }
}

