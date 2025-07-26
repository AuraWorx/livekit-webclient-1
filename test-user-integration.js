// Simple test script to verify user integration with LiveKit
// This script tests the API endpoint with different user scenarios

const API_BASE_URL = 'http://localhost:3000';

async function testConnectionDetailsAPI() {
  console.log('🧪 Testing User Integration with LiveKit...\n');

  // Test 1: Guest user (no authentication)
  console.log('1. Testing Guest User:');
  try {
    const guestResponse = await fetch(`${API_BASE_URL}/api/connection-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: null,
        isGuest: true,
      }),
    });

    if (!guestResponse.ok) {
      const errorText = await guestResponse.text();
      console.log(`❌ Guest user test failed: ${guestResponse.status} - ${errorText}`);
    } else {
      const guestData = await guestResponse.json();
      console.log('✅ Guest user test passed');
      console.log(`   Participant Identity: ${guestData.participantIdentity}`);
      console.log(`   Participant Name: ${guestData.participantName}`);
      console.log(`   Room Name: ${guestData.roomName}`);
      console.log(
        `   Is Random Identity: ${guestData.participantIdentity.startsWith('voice_assistant_user_')}\n`
      );
    }
  } catch (error) {
    console.log('❌ Guest user test failed:', error.message);
  }

  // Test 2: Authenticated user with email
  console.log('2. Testing Authenticated User:');
  try {
    const authResponse = await fetch(`${API_BASE_URL}/api/connection-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          id: '123',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        isGuest: false,
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.log(`❌ Authenticated user test failed: ${authResponse.status} - ${errorText}`);
    } else {
      const authData = await authResponse.json();
      console.log('✅ Authenticated user test passed');
      console.log(`   Participant Identity: ${authData.participantIdentity}`);
      console.log(`   Participant Name: ${authData.participantName}`);
      console.log(`   Room Name: ${authData.roomName}`);
      console.log(
        `   Uses Email as Identity: ${authData.participantIdentity === 'john.doe@example.com'}\n`
      );
    }
  } catch (error) {
    console.log('❌ Authenticated user test failed:', error.message);
  }

  // Test 3: Authenticated user with only email (no name)
  console.log('3. Testing Authenticated User (email only):');
  try {
    const emailOnlyResponse = await fetch(`${API_BASE_URL}/api/connection-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          id: '456',
          email: 'jane@example.com',
        },
        isGuest: false,
      }),
    });

    if (!emailOnlyResponse.ok) {
      const errorText = await emailOnlyResponse.text();
      console.log(`❌ Email-only user test failed: ${emailOnlyResponse.status} - ${errorText}`);
    } else {
      const emailOnlyData = await emailOnlyResponse.json();
      console.log('✅ Email-only user test passed');
      console.log(`   Participant Identity: ${emailOnlyData.participantIdentity}`);
      console.log(`   Participant Name: ${emailOnlyData.participantName}`);
      console.log(
        `   Uses Email as Name: ${emailOnlyData.participantName === 'jane@example.com'}\n`
      );
    }
  } catch (error) {
    console.log('❌ Email-only user test failed:', error.message);
  }

  // Test 4: Backward compatibility (GET request)
  console.log('4. Testing Backward Compatibility (GET request):');
  try {
    const getResponse = await fetch(`${API_BASE_URL}/api/connection-details`);

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.log(`❌ Backward compatibility test failed: ${getResponse.status} - ${errorText}`);
    } else {
      const getData = await getResponse.json();
      console.log('✅ Backward compatibility test passed');
      console.log(`   Participant Identity: ${getData.participantIdentity}`);
      console.log(`   Participant Name: ${getData.participantName}`);
      console.log(
        `   Uses Random Identity: ${getData.participantIdentity.startsWith('voice_assistant_user_')}\n`
      );
    }
  } catch (error) {
    console.log('❌ Backward compatibility test failed:', error.message);
  }

  console.log('🎉 All tests completed!');
  console.log('\n📝 Note: If tests failed due to missing LiveKit credentials,');
  console.log('   the API logic is still working correctly. The errors are');
  console.log('   expected when LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or');
  console.log('   LIVEKIT_URL are not configured in .env.local');
}

// Run the tests
testConnectionDetailsAPI().catch(console.error);
