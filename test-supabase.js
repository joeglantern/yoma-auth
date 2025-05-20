require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testSupabaseSave() {
  try {
    const testUser = {
      yoma_user_id: 'test-' + Date.now(),
      first_name: 'Test',
      surname: 'User',
      email: 'test' + Date.now() + '@example.com',
      display_name: 'Test User',
      phone_number: '+254758009278',
      country_code: 'KE',
      education_id: '2c0f0175-7007-40bf-9bf9-6d15b793bc09',
      gender_id: '6dbd31e9-5196-49ca-8d3b-8354a9bff996',
      date_of_birth: '2003-08-03'
    };

    console.log('Attempting to save test user:', testUser);

    const { data, error } = await supabase
      .from('onboarded_users')
      .insert(testUser)
      .select()
      .single();

    if (error) {
      console.error('Error saving user:', error);
      return;
    }

    console.log('Successfully saved user:', data);
  } catch (error) {
    console.error('Failed to save user:', error);
  }
}

testSupabaseSave(); 