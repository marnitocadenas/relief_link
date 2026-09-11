<?php

namespace Database\Seeders;

use App\Models\{AidRequest,Donation,User};
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $admin=User::factory()->create(['name'=>'ReliefLink Admin','email'=>'admin@relieflink.test','password'=>'password','role'=>'admin']);
        $staff=User::factory()->create(['name'=>'ReliefLink Campus Staff','email'=>'staff@relieflink.test','password'=>'password','role'=>'staff']);
        $donors=User::factory(5)->create(['role'=>'donor']); $beneficiaries=User::factory(5)->create(['role'=>'beneficiary']);
        $categories=['food','clothing','school supplies','hygiene'];
        foreach(range(1,10) as $i){$donors[($i-1)%5]->donations()->create(['item_name'=>"Campus donation {$i}",'category'=>$categories[$i%4],'quantity'=>5+$i,'condition_notes'=>'Clean and ready to share','availability_window'=>'Weekdays 9am–5pm']);$beneficiaries[($i-1)%5]->aidRequests()->create(['category'=>$categories[$i%4],'quantity_needed'=>2+$i,'urgency'=>$i===1?'high':($i%2?'medium':'low'),'justification'=>'Support needed for student wellbeing and essential supplies.','status'=>$i<8?'approved':'pending_review']);}
    }
}
