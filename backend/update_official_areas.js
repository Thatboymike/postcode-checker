/**
 * Comprehensive update script to incorporate official bushfire and natural disaster areas
 * from Australian immigration official sources
 */
const fs = require('fs');
const path = require('path');

console.log('Updating postcode database with official bushfire and natural disaster areas...');

// Load current postcode data
const postcodeFile = path.join(__dirname, 'postcodes.json');
const postcodes = JSON.parse(fs.readFileSync(postcodeFile, 'utf8'));

// Function to expand postcode ranges like "2069 to 2076" into individual postcodes
function expandPostcodeRanges(input) {
  const result = new Set();
  
  // Split the input by commas and process each entry
  input.split(',').forEach(entry => {
    entry = entry.trim();
    
    // Check if this is a range (e.g., "2069 to 2076" or "2069-2076")
    if (entry.includes(' to ') || entry.includes('-')) {
      const parts = entry.split(/\s+to\s+|-/);
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      
      // Add all postcodes in the range
      for (let i = start; i <= end; i++) {
        result.add(i.toString().padStart(4, '0'));
      }
    } else {
      // Single postcode
      const code = entry.trim();
      if (/^\d{4}$/.test(code)) {
        result.add(code);
      }
    }
  });
  
  return [...result];
}

// Official bushfire declared areas from government data
const bushfireAreas = {
  'ACT': 'All postcodes',
  'NSW': '2069 to 2076, 2083, 2172, 2173, 2178, 2224 to 2234, 2250, 2251, 2256 to 2265, 2267, 2278, 2280 to 2287, 2289, 2290, 2305, 2306, 2311, 2312, 2315 to 2331, 2333 to 2341, 2344 to 2347, 2350, 2352 to 2356, 2358 to 2361, 2365, 2369 to 2372, 2386 to 2388, 2390, 2397 to 2406, 2408 to 2411, 2415, 2420 to 2431, 2439 to 2441, 2443 to 2450, 2452 to 2456, 2460, 2462 to 2466, 2469 to 2490, 2500, 2502, 2505, 2506, 2508, 2515 to 2519, 2525, 2526, 2530, 2536 to 2541, 2545, 2546, 2548 to 2551, 2555, 2560, 2568 to 2588, 2590, 2594, 2611, 2618 to 2633, 2640, 2642, 2644, 2646, 2649 to 2653, 2655, 2656, 2658 to 2661, 2678, 2702, 2710, 2716, 2720, 2722, 2725 to 2727, 2729, 2730, 2733, 2745, 2747 to 2750, 2752 to 2754, 2756 to 2760, 2765, 2773 to 2780, 2782 to 2787, 2790 to 2795, 2797 to 2800, 2803 to 2808, 2818, 2820, 2822, 2824 to 2826, 2828 to 2835, 2838 to 2840, 2844 to 2850, 2852, 2864 to 2868, 2870, 2873, 2877, 4377, 4380, 4383, 4385',
  'NT': '0822, 0847, 0852, 0854, 0860, 0862, 0870, 0872 to 0875',
  'QLD': '4114, 4118, 4119, 4124, 4125, 4127 to 4133, 4157 to 4161, 4163 to 4165, 4178, 4183, 4184, 4205, 4207 to 4218, 4220, 4221, 4223 to 4228, 4270, 4272, 4275, 4280, 4285, 4287, 4300, 4301, 4303 to 4307, 4309 to 4314, 4340 to 4344, 4346, 4347, 4350, 4352 to 4365, 4370 to 4378, 4380 to 4385, 4387, 4388, 4390, 4400 to 4407, 4417, 4426 to 4428, 4454, 4455, 4461, 4462, 4465, 4467, 4474, 4480, 4486 to 4488, 4492 to 4494, 4496 to 4498, 4515, 4517 to 4519, 4550, 4551, 4553 to 4575, 4580, 4581, 4600, 4601, 4614, 4615, 4621, 4625 to 4627, 4630, 4670, 4671, 4673, 4674, 4676 to 4678, 4680, 4694, 4695, 4697, 4700 to 4706, 4709 to 4712, 4717, 4720, 4722, 4723, 4741, 4810 to 4812, 4814 to 4816, 4818, 4819, 4849, 4850, 4852, 4854 to 4856, 4858 to 4861, 4865, 4868 to 4873, 4877 to 4888, 4890 to 4892, 4895',
  'SA': '5052, 5072, 5073, 5076, 5110, 5112 to 5118, 5120, 5121, 5131 to 5134, 5136 to 5142, 5144, 5151 to 5157, 5201, 5204, 5220 to 5223, 5231 to 5238, 5240 to 5245, 5250 to 5255, 5259 to 5261, 5264 to 5267, 5271, 5273, 5275, 5301 to 5304, 5320, 5321, 5330, 5351, 5353, 5354, 5356, 5357, 5374, 5552, 5558, 5570 to 5573, 5575 to 5577, 5580 to 5583, 5605 to 5607, 5630 to 5632',
  'TAS': '7017, 7026, 7027, 7030, 7116, 7119, 7120, 7140, 7190, 7212 to 7216, 7264, 7270, 7275, 7304',
  'VIC': '3023, 3024, 3029, 3037, 3104, 3114 to 3116, 3125, 3127 to 3140, 3145, 3147 to 3156, 3158, 3160 to 3163, 3165 to 3175, 3177 to 3180, 3183, 3185, 3187, 3189, 3190, 3192, 3194 to 3202, 3204, 3211 to 3227, 3233, 3234, 3236 to 3239, 3241 to 3243, 3249 to 3251, 3254, 3260, 3264 to 3266, 3268, 3270 to 3287, 3289, 3292 to 3294, 3300 to 3305, 3309 to 3312, 3314, 3315, 3321 to 3323, 3328 to 3338, 3340 to 3342, 3345, 3350 to 3352, 3355 to 3358, 3373 to 3375, 3377 to 3381, 3467 to 3469, 3317 to 3319, 3360 to 3364, 3370, 3371, 3384, 3385, 3387, 3388, 3393, 3395, 3400, 3401, 3407, 3409, 3412 to 3415, 3418 to 3420, 3423, 3424, 3427, 3430 to 3435, 3437, 3438, 3440 to 3442, 3444, 3446 to 3448, 3450, 3451, 3453, 3458, 3460 to 3465, 3472, 3475, 3477, 3478, 3480, 3482, 3483, 3485, 3488, 3490, 3515, 3516, 3518, 3521 to 3523, 3525, 3527, 3529, 3530 to 3533, 3544, 3550, 3551, 3555 to 3559, 3570, 3600, 3607, 3608, 3610, 3612, 3614, 3616 to 3618, 3629 to 3631, 3633, 3634, 3646, 3647, 3658, 3659, 3660, 3662 to 3666, 3669, 3670, 3672, 3673, 3675, 3677, 3682, 3683, 3685, 3687, 3688, 3690, 3691, 3695, 3697 to 3701, 3704, 3705, 3707 to 3709, 3711 to 3715, 3717 to 3720, 3722, 3723, 3725, 3726, 3732, 3733, 3735, 3737 to 3741, 3744, 3746, 3747, 3749, 3753, 3756 to 3758, 3762 to 3767, 3770, 3777 to 3779, 3781 to 3783, 3785 to 3789, 3791 to 3793, 3795 to 3797, 3802 to 3810, 3812 to 3816, 3818, 3820 to 3825, 3831 to 3833, 3835, 3840, 3842, 3844, 3847, 3850 to 3852, 3854, 3856 to 3860, 3862, 3864, 3865, 3869 to 3871, 3873 to 3875, 3878, 3880, 3882, 3885 to 3893, 3895 to 3896, 3898, 3900, 3902 to 3904, 3909 to 3913, 3915, 3916, 3918 to 3920, 3922, 3923, 3925 to 3931, 3933, 3934, 3936 to 3946, 3950, 3951, 3953, 3954, 3956 to 3960, 3962, 3964 to 3967, 3971, 3975 to 3981, 3984, 3987, 3988, 3990 to 3992, 3995, 3996',
  'WA': '6030 to 6038, 6055, 6063 to 6069, 6077 to 6079, 6083, 6090, 6302, 6304, 6306, 6528, 6628, 6630 to 6632, 6635, 6640, 6642, 6646, 6705, 6721, 6722, 6725, 6726, 6753, 6758, 6760, 6762'
};

// Official natural disaster declared areas from government data
const disasterAreas = {
  'NSW': '2011, 2018 to 2022, 2031, 2032, 2035, 2036, 2038 to 2042, 2044, 2045, 2048 to 2050, 2063, 2067, 2069 to 2077, 2079 to 2087, 2092 to 2097, 2099 to 2108, 2112 to 2122, 2125 to 2128, 2130 to 2133, 2141 to 2148, 2150 to 2168, 2170 to 2179, 2190 to 2200, 2203 to 2214, 2216 to 2234, 2250, 2251, 2256 to 2263, 2287, 2289, 2291 to 2300, 2302 to 2305, 2307, 2308, 2311, 2312, 2315 to 2331, 2333 to 2347, 2350, 2352 to 2361, 2365, 2369 to 2372, 2379 to 2382, 2386 to 2388, 2390, 2395 to 2406, 2408 to 2411, 2415, 2420 to 2431, 2439 to 2441, 2443 to 2450, 2452 to 2456, 2460, 2462 to 2466, 2469 to 2490, 2500, 2502, 2505, 2506, 2508, 2515 to 2519, 2525 to 2530, 2533 to 2541, 2545, 2546, 2548 to 2551, 2555 to 2560, 2563 to 2588, 2590, 2594, 2611, 2618 to 2633, 2640 to 2653, 2655, 2656, 2658 to 2661, 2663, 2665, 2666, 2668, 2669, 2671, 2672, 2675, 2678, 2680, 2681, 2700 to 2703, 2705 to 2707, 2710 to 2717, 2720 to 2722, 2725 to 2727, 2729 to 2739, 2745, 2747 to 2750, 2752 to 2754, 2756 to 2763, 2765 to 2770, 2773 to 2780, 2782 to 2787, 2790 to 2795, 2797 to 2800, 2803 to 2810, 2817, 2818, 2820 to 2836, 2838 to 2840, 2842 to 2850, 2852, 2864 to 2871, 2873 to 2880, 2898, 3644, 3707, 4375, 4377, 4380, 4383, 4385',
  'NT': '0822, 0847, 0852, 0854, 0860, 0862, 0870, 0872 to 0875, 0886',
  'QLD': '4000, 4005 to 4014, 4017 to 4022, 4025, 4030 to 4032, 4034 to 4037, 4051, 4053 to 4055, 4059 to 4061, 4064 to 4070, 4073 to 4078, 4101 to 4125, 4127 to 4133, 4151 to 4161, 4163 to 4165, 4169 to 4174, 4178, 4179, 4183, 4184, 4205, 4207 to 4218, 4220, 4221, 4223 to 4228, 4270, 4272, 4275, 4280, 4285, 4287, 4300, 4301, 4303 to 4307, 4309 to 4314, 4340 to 4344, 4346, 4347, 4350, 4352 to 4365, 4370 to 4378, 4380 to 4385, 4387, 4388, 4390, 4400 to 4408, 4410 to 4413, 4415 to 4428, 4454, 4455, 4461, 4462, 4465, 4467, 4468, 4470, 4472, 4474, 4477, 4479 to 4481, 4486 to 4494, 4496 to 4498, 4500 to 4512, 4514 to 4521, 4550 to 4575, 4580, 4581, 4600, 4601, 4605, 4606, 4608, 4610 to 4615, 4620, 4621, 4625 to 4627, 4630, 4650, 4655, 4659, 4660, 4662, 4670, 4671, 4673, 4674, 4676 to 4678, 4680, 4694, 4695, 4697, 4699 to 4702, 4709, 4712, 4714 to 4720, 4722 to 4724, 4727, 4730, 4733, 4735, 4736, 4741, 4800, 4804 to 4812, 4814 to 4816, 4818, 4819, 4822 to 4825, 4828 to 4830, 4849, 4850, 4852, 4854 to 4856, 4858 to 4861, 4865, 4868 to 4888, 4890 to 4892, 4895',
  'SA': '0872, 5157, 5172, 5201, 5210 to 5214, 5236 to 5238, 5253 to 5256, 5259 to 5261, 5264 to 5267, 5301, 5302, 5304, 5306 to 5311, 5321, 5322, 5330 to 5333, 5340 to 5346, 5354, 5357',
  'TAS': 'All areas',
  'VIC': '2640, 2641, 3000, 3002 to 3004, 3006, 3008, 3011, 3013, 3019, 3024, 3029, 3031, 3032, 3034, 3039 to 3041, 3051 to 3054, 3065 to 3067, 3089 to 3091, 3096, 3097, 3099, 3101 to 3104, 3116, 3121 to 3133, 3135 to 3141, 3145 to 3156, 3158 to 3163, 3165 to 3175, 3177 to 3180, 3183, 3185, 3187, 3189, 3190, 3192, 3194 to 3202, 3204, 3207, 3211 to 3227, 3243, 3249 to 3251, 3254, 3260, 3264 to 3272, 3277, 3280 to 3283, 3285, 3289, 3292 to 3294, 3300 to 3305, 3309 to 3312, 3314, 3315, 3317, 3321 to 3325, 3328 to 3334, 3335 to 3338, 3340 to 3342, 3345, 3350 to 3352, 3355 to 3358, 3360 to 3364, 3370, 3371, 3373 to 3375, 3377 to 3381, 3384, 3385, 3387, 3388, 3393, 3395, 3400, 3401, 3407, 3409, 3431 to 3435, 3437, 3438, 3440 to 3442, 3444, 3446 to 3448, 3450, 3451, 3453, 3458, 3460 to 3465, 3467 to 3469, 3472, 3475, 3477, 3478, 3480, 3482, 3483, 3485, 3488, 3489, 3491, 3494, 3496, 3498, 3500, 3501, 3505 to 3507, 3509, 3512, 3515 to 3518, 3520 to 3523, 3525, 3527, 3529 to 3531, 3533, 3537, 3540, 3542, 3544, 3546, 3549 to 3551, 3555 to 3559, 3561 to 3568, 3570 to 3573, 3575, 3576, 3579 to 3581, 3583 to 3586, 3588 to 3591, 3594 to 3597, 3599, 3607, 3608, 3610, 3612, 3614, 3616 to 3618, 3620 to 3624, 3629 to 3631, 3633 to 3641, 3644, 3646, 3647, 3649, 3658 to 3660, 3662 to 3666, 3669, 3670, 3672, 3673, 3675, 3677, 3678, 3682, 3683, 3685, 3687, 3688, 3690, 3691, 3695, 3697 to 3701, 3704, 3705, 3707 to 3709, 3711 to 3715, 3717 to 3720, 3722, 3723, 3725 to 3728, 3730, 3732, 3733, 3735, 3737 to 3741, 3744, 3746, 3747, 3749, 3754, 3756 to 3767, 3770, 3775, 3777 to 3779, 3799, 3781 to 3783, 3785 to 3789, 3791 to 3793, 3795 to 3797, 3802 to 3810, 3812 to 3816, 3818, 3820 to 3825, 3831 to 3833, 3835, 3840, 3842, 3844, 3847, 3850 to 3852, 3854, 3856 to 3860, 3862, 3864, 3865, 3869 to 3871, 3873 to 3875, 3878, 3880, 3882, 3885 to 3893, 3895, 3896, 3898, 3900, 3902 to 3904, 3909 to 3913, 3915, 3916, 3918 to 3920, 3922, 3923, 3925 to 3931, 3933, 3934, 3936 to 3946, 3950 to 3951, 3953 to 3954, 3956 to 3960, 3962, 3964 to 3967, 3971, 3975 to 3981, 3984, 3987, 3988, 3990 to 3992, 3995, 3996',
  'WA': '0872, 6030 to 6038, 6055, 6063 to 6069, 6077 to 6079, 6083, 6090, 6227 to 6230, 6232, 6233, 6236, 6254, 6275, 6280 to 6282, 6284 to 6286, 6288, 6290, 6302, 6304, 6306, 6336, 6337, 6346, 6385, 6429 to 6434, 6436 to 6438, 6440, 6442, 6443, 6450, 6528, 6532, 6535, 6536, 6623, 6628, 6630 to 6632, 6635, 6639, 6640, 6642, 6646, 6701, 6705, 6710, 6712 to 6714, 6718, 6720 to 6722, 6725, 6726, 6728, 6740, 6743, 6753, 6758, 6760, 6762, 6765, 6770'
};

// Process bushfire areas
const bushfirePostcodes = new Set();

Object.entries(bushfireAreas).forEach(([state, postcodeList]) => {
  if (postcodeList === 'All postcodes' || postcodeList === 'All areas') {
    console.log(`All ${state} postcodes marked as bushfire areas`);
    
    // For ACT, use 0200-0299, 2600-2620, 2900-2920
    if (state === 'ACT') {
      for (let i = 200; i <= 299; i++) bushfirePostcodes.add(i.toString().padStart(4, '0'));
      for (let i = 2600; i <= 2620; i++) bushfirePostcodes.add(i.toString());
      for (let i = 2900; i <= 2920; i++) bushfirePostcodes.add(i.toString());
    }
  } else {
    // Expand and add postcode ranges
    const expanded = expandPostcodeRanges(postcodeList);
    expanded.forEach(code => bushfirePostcodes.add(code));
  }
});

// Process natural disaster areas
const disasterPostcodes = new Set();

Object.entries(disasterAreas).forEach(([state, postcodeList]) => {
  if (postcodeList === 'All postcodes' || postcodeList === 'All areas') {
    console.log(`All ${state} postcodes marked as natural disaster areas`);
    
    // For Tasmania, use 7000-7999
    if (state === 'TAS') {
      for (let i = 7000; i <= 7999; i++) disasterPostcodes.add(i.toString());
    }
  } else {
    // Expand and add postcode ranges
    const expanded = expandPostcodeRanges(postcodeList);
    expanded.forEach(code => disasterPostcodes.add(code));
  }
});

console.log(`Processed ${bushfirePostcodes.size} bushfire postcodes and ${disasterPostcodes.size} natural disaster postcodes`);

// Apply updates to database
let bushfireUpdated = 0;
let disasterUpdated = 0;
let missingPostcodes = 0;

// Apply bushfire postcodes
bushfirePostcodes.forEach(code => {
  if (postcodes[code]) {
    postcodes[code].bushfire = true;
    bushfireUpdated++;
  } else {
    // Add missing postcode
    postcodes[code] = {
      regional: false, // Default to false, other processes can update regional status
      remote: false,
      northern: false,
      bushfire: true,
      disaster: false
    };
    missingPostcodes++;
    bushfireUpdated++;
  }
});

// Apply disaster postcodes
disasterPostcodes.forEach(code => {
  if (postcodes[code]) {
    postcodes[code].disaster = true;
    disasterUpdated++;
  } else {
    // Add missing postcode
    postcodes[code] = {
      regional: false, // Default to false, other processes can update regional status
      remote: false,
      northern: false,
      bushfire: false,
      disaster: true
    };
    missingPostcodes++;
    disasterUpdated++;
  }
});

// Create backup before saving
const backupFile = path.join(__dirname, `postcodes_backup_${Date.now()}.json`);
fs.writeFileSync(backupFile, fs.readFileSync(postcodeFile));
console.log(`Created backup at ${backupFile}`);

// Save updated data
fs.writeFileSync(postcodeFile, JSON.stringify(postcodes, null, 2));
console.log(`Saved updated database with ${bushfireUpdated} bushfire areas and ${disasterUpdated} natural disaster areas`);
console.log(`Added ${missingPostcodes} missing postcodes`);

console.log('\nUpdate complete. Please restart your backend server to apply changes.');
