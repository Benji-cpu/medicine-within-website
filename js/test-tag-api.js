/**
 * ConvertKit Tag Subscription Test Script
 * 
 * Tests all four customer journey tags to verify they work correctly
 * 
 * Usage:
 * 1. Open browser console on any page that loads config.js
 * 2. Copy and paste this entire script
 * 3. Run: testAllTags()
 */

async function testTagSubscription(tagId, tagName, email) {
    try {
        const url = `https://api.convertkit.com/v3/tags/${tagId}/subscribe`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                api_key: window.MEDICINE_WITHIN_CONFIG.convertKit.apiKey,
                email: email
            })
        });

        const data = await response.json();

        if (response.ok && data.subscription) {
            return {
                success: true,
                tagName: tagName,
                tagId: tagId,
                subscriberId: data.subscription.subscriber?.id,
                subscriptionId: data.subscription.id,
                state: data.subscription.state,
                email: email
            };
        } else {
            return {
                success: false,
                tagName: tagName,
                tagId: tagId,
                error: data.message || 'Unknown error',
                email: email
            };
        }
    } catch (error) {
        return {
            success: false,
            tagName: tagName,
            tagId: tagId,
            error: error.message,
            email: email
        };
    }
}

async function testAllTags() {
    console.log('🧪 Testing ConvertKit Tag Subscriptions...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!window.MEDICINE_WITHIN_CONFIG?.convertKit?.tags) {
        console.error('❌ Tag configuration not found! Make sure config.js is loaded.');
        return;
    }

    const tags = window.MEDICINE_WITHIN_CONFIG.convertKit.tags;
    const tagMapping = {
        general: { id: tags.general, name: 'interest-general', journey: 'Homepage' },
        temple: { id: tags.temple, name: 'interest-temple', journey: 'Temple Page' },
        retreats: { id: tags.retreats, name: 'interest-retreats', journey: 'Retreats Page' },
        kambo: { id: tags.kambo, name: 'interest-kambo', journey: 'Kambo Page' }
    };

    const results = [];
    const timestamp = Date.now();

    for (const [key, info] of Object.entries(tagMapping)) {
        const testEmail = `test-${info.name}-${timestamp}@test.medicinewithin.nl`;
        console.log(`\n📧 Testing ${info.journey}...`);
        console.log(`   Tag: ${info.name} (ID: ${info.id})`);
        console.log(`   Email: ${testEmail}`);

        const result = await testTagSubscription(info.id, info.name, testEmail);
        results.push({ ...result, journey: info.journey });

        if (result.success) {
            console.log(`   ✅ SUCCESS`);
            console.log(`   Subscriber ID: ${result.subscriberId}`);
            console.log(`   Subscription ID: ${result.subscriptionId}`);
            console.log(`   State: ${result.state}`);
        } else {
            console.log(`   ❌ FAILED: ${result.error}`);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 Test Summary:\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}\n`);

    if (successful.length > 0) {
        console.log('✅ Successful Subscriptions:');
        successful.forEach(r => {
            console.log(`   • ${r.journey}: ${r.tagName} → Subscriber #${r.subscriberId}`);
        });
    }

    if (failed.length > 0) {
        console.log('\n❌ Failed Subscriptions:');
        failed.forEach(r => {
            console.log(`   • ${r.journey}: ${r.tagName} → ${r.error}`);
        });
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Check ConvertKit dashboard → Subscribers');
    console.log('   2. Search for emails starting with "test-interest-"');
    console.log('   3. Verify each subscriber has the correct tag assigned');
    console.log('   4. Set up email sequences/automations for each tag\n');

    return results;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.testAllTags = testAllTags;
    window.testTagSubscription = testTagSubscription;
    console.log('✅ Test functions loaded! Run: testAllTags()');
}

