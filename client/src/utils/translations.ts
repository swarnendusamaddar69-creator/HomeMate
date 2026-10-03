import { Language } from '../types';

export interface TranslationDictionary {
  // Brand & Common
  appName: string;
  tagline: string;
  deviceCameraLive: string;
  openFridgeCamera: string;
  widgets: string;
  switchProfile: string;
  logout: string;
  undo: string;
  addedToList: string;
  completed: string;
  pending: string;
  statusSettled: string;
  allOk: string;
  readAloud: string;
  searchPlaceholder: string;

  // Login & Setup
  loginTitle: string;
  loginSubtitle: string;
  chooseProfile: string;
  chooseProfileSubtitle: string;
  elderProfileTitle: string;
  elderProfileDesc: string;
  elderProfileBadge: string;
  elderCaregiverHint: string;
  elderQuickLogin: string;
  hostelProfileTitle: string;
  hostelProfileDesc: string;
  hostelProfileBadge: string;
  hostelRoomHint: string;
  hostelQuickLogin: string;
  familyProfileTitle: string;
  familyProfileDesc: string;
  familyProfileBadge: string;
  familyMembersHint: string;
  familyQuickLogin: string;
  loginButton: string;
  switchLanguageNotice: string;

  // Camera Banner
  cameraBannerTitleElder: string;
  cameraBannerTitleHostel: string;
  cameraBannerTitleFamily: string;
  cameraBannerSubtitle: string;

  // Elder View
  elderGreeting: string;
  caregiverConnected: string;
  dailyCheckinTitle: string;
  dailyCheckinDone: string;
  dailyCheckinDesc: string;
  dailyCheckinDoneDesc: string;
  iAmDoingWellBtn: string;
  familyNotified: string;
  elderTodosTitle: string;
  elderTodosSubtitle: string;
  todaysProgress: string;
  addRoutinePlaceholder: string;
  addRoutineBtn: string;
  routineNotificationCenter: string;
  systemPushActive: string;
  enableBrowserPush: string;
  soundVoiceOn: string;
  soundVoiceMuted: string;
  testAlarmBtn: string;
  elderKiranaTitle: string;
  elderKiranaSubtitle: string;
  sendToKiranaWhatsApp: string;
  readListBtn: string;
  quickStaplesHeader: string;
  addKiranaPlaceholder: string;
  addItemBtn: string;
  hideQuickCommerce: string;
  showQuickCommerceElder: string;
  medScheduleTitle: string;
  medScheduleSubtitle: string;
  lowStockAlert: string;
  orderRefillBtn: string;
  refillAdded: string;
  takeDoseBtn: string;
  skipDoseBtn: string;
  takenToday: string;

  // Hostel View
  hostelBannerTitle: string;
  hostelBannerSubtitle: string;
  examModeBtn: string;
  examModeActive: string;
  messMenuTitle: string;
  lunchLabel: string;
  dinnerLabel: string;
  skipMessPrompt: string;
  skipMessBtn: string;
  skippingMessActive: string;
  suggestedLateMeal: string;
  budgetFriendlyBadge: string;
  penaltyJarTitle: string;
  penaltyJarDesc: string;
  weeklyBudgetTitle: string;
  weeklyBudgetDesc: string;
  choresRotaTitle: string;
  choresRotaSubtitle: string;
  doneBtn: string;
  skipPenaltyBtn: string;
  choreCompletedBadge: string;
  sharedExpensesTitle: string;
  sharedExpensesSubtitle: string;
  addExpensePlaceholder: string;
  amountPlaceholder: string;
  addExpenseBtn: string;
  payUpiBtn: string;
  markSettledBtn: string;
  midnightSnacksTitle: string;
  midnightSnacksSubtitle: string;
  shareToFlatWhatsApp: string;
  quickSnacksHeader: string;
  addSnackPlaceholder: string;
  splitInFlatBtn: string;

  // Family View
  familyBannerTitle: string;
  familyBannerSubtitle: string;
  sharedKiranaTitle: string;
  sharedKiranaSubtitle: string;
  sendListWhatsApp: string;
  copyForQuickCommerce: string;
  allCategories: string;
  dairyCategory: string;
  veggiesCategory: string;
  staplesCategory: string;
  snacksCategory: string;
  choreFairnessTitle: string;
  choreFairnessSubtitle: string;
  billsRechargeTitle: string;
  billsRechargeSubtitle: string;
  markPaidBtn: string;
  paidBadge: string;

  // Quick Commerce Hub
  qcTitle: string;
  qcSubtitle: string;
  zeptoDelivery: string;
  blinkitDelivery: string;
  localKiranaStore: string;
  zeptoEta: string;
  blinkitEta: string;
  instamartEta: string;
  addToCartBtn: string;
  addedBtn: string;
  allFilter: string;
  elderFilter: string;
  hostelFilter: string;
  familyFilter: string;

  // Auth & Accounts
  signInTab: string;
  joinHouseholdTab: string;
  createHouseholdTab: string;
  usernameLabel: string;
  passwordLabel: string;
  householdCodeLabel: string;
  adminRoleBadge: string;
  memberRoleBadge: string;
  switchAccount: string;
  copyHouseholdCode: string;
  codeCopied: string;
  demoAccounts: string;
  loginErrorMsg: string;
  householdNotFoundMsg: string;

  // Splitwise
  splitwiseTitle: string;
  splitwiseSubtitle: string;
  totalFlatSpend: string;
  youAreOwed: string;
  youOwe: string;
  allSettledNotice: string;
  settleUpBtn: string;
  recordSettlement: string;
  splitEqually: string;
  customSplit: string;
  paidByLabel: string;
  splitWithLabel: string;
  payerPlaceholder: string;
  whoPaid: string;

  // Edit Grocery Item
  editItem: string;
  editItemTitle: string;
  itemQuantity: string;
  itemUnit: string;
  saveBtn: string;
  cancelBtn: string;

  // Family Chores & AI suggestions
  familyChoresTitle: string;
  familyChoresSubtitle: string;
  assignedTo: string;
  addChoreBtn: string;
  addChorePlaceholder: string;
  aiSuggestChores: string;
  refreshChores: string;
  choreCompleted: string;
  chorePending: string;
  aiSuggestHostelChore: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    // Brand & Common
    appName: 'HomeMate AI OS',
    tagline: 'Adaptive Autonomous Operating System for Homes & Flats',
    deviceCameraLive: 'Device Camera Live',
    openFridgeCamera: 'Open AI Fridge Camera',
    widgets: 'Widgets',
    switchProfile: 'Switch Household',
    logout: 'Exit Mode',
    undo: 'Undo',
    addedToList: 'Added to grocery list',
    completed: 'Completed',
    pending: 'Pending',
    statusSettled: 'Settled',
    allOk: 'All OK',
    readAloud: 'Read Aloud',
    searchPlaceholder: 'Search items, vegetables, snacks...',

    // Login & Setup
    loginTitle: 'Welcome to HomeMate AI OS',
    loginSubtitle: 'Choose your household environment to unlock your dedicated standalone assistant',
    chooseProfile: 'Select Your Household Environment',
    chooseProfileSubtitle: 'Each environment provides a custom, dedicated workspace without clutter',
    elderProfileTitle: 'Elder Care & Senior Living',
    elderProfileDesc: 'High-contrast large buttons, audio chimes, daily wellness check-in, medicine schedule & 1-tap WhatsApp Kirana order',
    elderProfileBadge: 'Senior Friendly',
    elderCaregiverHint: 'Family caregiver connected: Priya (Daughter)',
    elderQuickLogin: 'Launch Elder Care Mode',
    hostelProfileTitle: 'Hostel & Flatmates',
    hostelProfileDesc: 'Zero roommate fights: chore rotation, penalty jar, midnight snacks list & 1-tap UPI split with QR codes',
    hostelProfileBadge: 'Flatmates B-302',
    hostelRoomHint: 'Active Flatmates: Rohan, Vikram, Ankit',
    hostelQuickLogin: 'Launch Hostel Flat Mode',
    familyProfileTitle: 'Family Household',
    familyProfileDesc: 'Shared household Kirana board, AI fridge scanner, chore fairness meter & monthly utility bill reminders',
    familyProfileBadge: 'Sharma Family',
    familyMembersHint: 'Members: Papa, Mummy, Aarav',
    familyQuickLogin: 'Launch Family Home Mode',
    loginButton: 'Enter Dedicated Workspace',
    switchLanguageNotice: 'Switch preferred language anytime from top bar',

    // Camera Banner
    cameraBannerTitleElder: 'Scan Fridge & Kitchen with AI Camera',
    cameraBannerTitleHostel: 'AI Fridge & Midnight Dabba Scanner',
    cameraBannerTitleFamily: 'Multimodal AI Fridge & Steel Dabba Scanner',
    cameraBannerSubtitle: 'Live viewfinder scans items, detects low stocks, and remembers opaque dabbas',

    // Elder View
    elderGreeting: 'Good Day! How are you feeling today?',
    caregiverConnected: 'Caregiver connected: Priya (Daughter) • Regular updates active',
    dailyCheckinTitle: 'Daily Check-in: "I am Doing Well"',
    dailyCheckinDone: '✓ Check-in Complete! All OK',
    dailyCheckinDesc: 'Tap this big button each morning so your family knows you are safe, healthy, and smiling.',
    dailyCheckinDoneDesc: 'Priya (Daughter) was notified at 8:30 AM that you are up and doing well.',
    iAmDoingWellBtn: 'I Am Doing Well!',
    familyNotified: 'Family Notified Today',
    elderTodosTitle: 'My Daily To-Do Checklist & Alarms',
    elderTodosSubtitle: 'Automated sound chimes & desktop reminders for health, walks, and blood pressure',
    todaysProgress: "Today's Progress",
    addRoutinePlaceholder: 'Add new routine (e.g. Evening walk, Read book)...',
    addRoutineBtn: 'Add Routine',
    routineNotificationCenter: 'Routine Notification Center',
    systemPushActive: '✓ System Push Active',
    enableBrowserPush: '🔔 Enable Browser Push',
    soundVoiceOn: 'Sound & Voice: ON',
    soundVoiceMuted: 'Muted',
    testAlarmBtn: 'Test Alarm',
    elderKiranaTitle: 'My Grocery & Essentials List (किराना सूची)',
    elderKiranaSubtitle: 'items needed • Share on WhatsApp to Sharma Ji Kirana or order on Zepto',
    sendToKiranaWhatsApp: 'Send to Kirana (WhatsApp)',
    readListBtn: 'Read List Aloud',
    quickStaplesHeader: '1-Tap Quick Essentials (ताज़ा ज़रूरतें):',
    addKiranaPlaceholder: 'Add Kirana item (e.g. Atta, Dolo 650, Apples)...',
    addItemBtn: 'Add Item',
    hideQuickCommerce: 'Hide 10-Min Delivery',
    showQuickCommerceElder: '⚡ Show 10-Min Home Delivery Recommendations (Zepto / Blinkit)',
    medScheduleTitle: "Today's Prescriptions",
    medScheduleSubtitle: 'Track doses and get automated refill alerts',
    lowStockAlert: 'Low Stock Alert',
    orderRefillBtn: 'Order Refill',
    refillAdded: '✓ Refill Added to List!',
    takeDoseBtn: 'Take Dose',
    skipDoseBtn: 'Skip',
    takenToday: 'Taken Today',

    // Hostel View
    hostelBannerTitle: 'Hostel Flatmate Operating Center',
    hostelBannerSubtitle: 'Zero roommate fights: Fair chore rotation, late-night cooking & 1-tap UPI QR splitting',
    examModeBtn: 'Exam Mode',
    examModeActive: 'Exam Mode Active (Silent Nudges)',
    messMenuTitle: "Today's Hostel Mess Menu",
    lunchLabel: 'Lunch (12:30 - 2:30 PM)',
    dinnerLabel: 'Dinner (8:00 - 10:00 PM)',
    skipMessPrompt: 'Mess food looking uninspiring tonight?',
    skipMessBtn: 'Skip Mess Tonight',
    skippingMessActive: '✓ Skipping Mess Tonight',
    suggestedLateMeal: 'Suggested Late-Night Meal: Spicy Egg Bhurji Toast • ₹28',
    budgetFriendlyBadge: '₹50 Budget Friendly',
    penaltyJarTitle: 'Chai & Samosa Penalty Jar',
    penaltyJarDesc: 'Skipping a chore adds ₹20 to the flat weekend snack fund. Keep flat clean or pay for tea!',
    weeklyBudgetTitle: 'Flat Weekly Spending',
    weeklyBudgetDesc: 'of weekly cap',
    choresRotaTitle: 'Roommate Chore Rotation & Penalties',
    choresRotaSubtitle: 'Rotating assignment so nobody gets stuck doing all the dishes or cleaning',
    doneBtn: 'Done',
    skipPenaltyBtn: 'Skip (+₹20)',
    choreCompletedBadge: 'Completed',
    sharedExpensesTitle: 'Roommate Shared Expenses & 1-Tap UPI QR',
    sharedExpensesSubtitle: 'Evenly split flat expenses with instant QR code popups for GPay / PhonePe / Paytm',
    addExpensePlaceholder: 'Expense title...',
    amountPlaceholder: '₹ Total',
    addExpenseBtn: 'Add Expense',
    payUpiBtn: 'Pay (QR / App)',
    markSettledBtn: 'Mark Settled',
    midnightSnacksTitle: 'Flatmate Midnight Snacks & Kirana List',
    midnightSnacksSubtitle: 'items needed • Instant delivery via Zepto (10m) / Blinkit (8m) • 1-tap UPI split',
    shareToFlatWhatsApp: 'Share to Flat WhatsApp',
    quickSnacksHeader: '1-Tap Hostel Additions (Late Night Fuel):',
    addSnackPlaceholder: 'Add snack or grocery item (e.g. Peanut Butter, Maggi)...',
    splitInFlatBtn: 'Split in Flat',

    // Family View
    familyBannerTitle: 'Shared Household Operating Center',
    familyBannerSubtitle: 'Real-time shared Kirana list, chore fairness meter & 1-tap utility bill reminders',
    sharedKiranaTitle: 'Shared Kirana & Grocery List',
    sharedKiranaSubtitle: 'items to buy • Synced across all household members',
    sendListWhatsApp: 'Send List to Kirana on WhatsApp',
    copyForQuickCommerce: 'Copy for Blinkit / Zepto',
    allCategories: 'All Items',
    dairyCategory: 'Dairy & Eggs',
    veggiesCategory: 'Vegetables',
    staplesCategory: 'Staples & Grains',
    snacksCategory: 'Snacks',
    choreFairnessTitle: 'Chore Fairness Meter',
    choreFairnessSubtitle: 'Who handled tasks this week',
    billsRechargeTitle: 'Upcoming Bills & Recharges',
    billsRechargeSubtitle: '1-Tap payment reminders with status tracking',
    markPaidBtn: 'Mark Paid',
    paidBadge: 'Paid ✓',

    // Quick Commerce Hub
    qcTitle: 'Quick Commerce Instant Delivery & Product Recommender',
    qcSubtitle: 'Live stock matching across Zepto (10m), Blinkit (8m), and Swiggy Instamart (11m)',
    zeptoDelivery: 'Zepto Delivery',
    blinkitDelivery: 'Blinkit Delivery',
    localKiranaStore: 'Local Kirana Store',
    zeptoEta: '10 mins',
    blinkitEta: '8 mins',
    instamartEta: '11 mins',
    addToCartBtn: 'Add to List',
    addedBtn: 'Added ✓',
    allFilter: 'All Items',
    elderFilter: 'Elder Health',
    hostelFilter: 'Hostel Snacks',
    familyFilter: 'Family Staples',

    // Auth & Accounts
    signInTab: 'Sign In',
    joinHouseholdTab: 'Join Household',
    createHouseholdTab: 'Create Household',
    usernameLabel: 'Username / ID',
    passwordLabel: 'Password',
    householdCodeLabel: 'Household Access Code',
    adminRoleBadge: 'Main User / Admin',
    memberRoleBadge: 'Roommate / Member',
    switchAccount: 'Switch Account / Logout',
    copyHouseholdCode: 'Share Code',
    codeCopied: 'Code Copied!',
    demoAccounts: '1-Click Demo Accounts',
    loginErrorMsg: 'Invalid username or password. Please try again or use a demo account.',
    householdNotFoundMsg: 'Household code not found. Please verify the code from the main user.',

    // Splitwise
    splitwiseTitle: 'Flat Splitwise & Expense Balances',
    splitwiseSubtitle: 'Track who paid what, calculate exact balances, and settle up with 1-tap UPI QR',
    totalFlatSpend: 'Total Flat Spend',
    youAreOwed: 'You are owed',
    youOwe: 'You owe',
    allSettledNotice: '✓ All balances settled! No pending roommate debts',
    settleUpBtn: 'Settle Up (UPI QR)',
    recordSettlement: 'Record Paid / Settle',
    splitEqually: 'Split Equally',
    customSplit: 'Custom Split',
    paidByLabel: 'Paid by',
    splitWithLabel: 'Split with',
    payerPlaceholder: 'Select who paid...',
    whoPaid: 'Who paid this expense?',

    // Edit Grocery Item
    editItem: 'Edit Item',
    editItemTitle: 'Edit Grocery Item & Quantity',
    itemQuantity: 'Quantity',
    itemUnit: 'Unit',
    saveBtn: 'Save Changes',
    cancelBtn: 'Cancel',

    // Family Chores & AI suggestions
    familyChoresTitle: 'Family House Chores & Responsibility Hub',
    familyChoresSubtitle: 'Daily tasks assigned to members, dynamic fairness meter & AI chore ideas',
    assignedTo: 'Assigned to',
    addChoreBtn: 'Add Chore',
    addChorePlaceholder: 'Add house chore (e.g. Water plants, Fold laundry)...',
    aiSuggestChores: '✨ AI Suggest Family Chores',
    refreshChores: 'Refresh Chores',
    choreCompleted: 'Done ✓',
    chorePending: 'To Do',
    aiSuggestHostelChore: '✨ AI Suggest Flat Chores',
  },

  hi: {
    // Brand & Common
    appName: 'होममेट AI OS',
    tagline: 'घरों और फ्लैट्स के लिए एडैप्टिव ऑपरेटिंग सिस्टम',
    deviceCameraLive: 'डिवाइस कैमरा चालू',
    openFridgeCamera: 'AI फ्रिज कैमरा खोलें',
    widgets: 'विजेट्स',
    switchProfile: 'प्रोफाइल बदलें',
    logout: 'मोड से बाहर निकलें',
    undo: 'वापस लें (Undo)',
    addedToList: 'किराना लिस्ट में जोड़ा गया',
    completed: 'पूर्ण',
    pending: 'बाकी',
    statusSettled: 'चुकता हुआ',
    allOk: 'सब ठीक है',
    readAloud: 'बोलकर सुनाएं',
    searchPlaceholder: 'सामान, सब्ज़ियां, स्नैक्स खोजें...',

    // Login & Setup
    loginTitle: 'होममेट AI OS में आपका स्वागत है',
    loginSubtitle: 'अपने घर या फ्लैट का वातावरण चुनें और अपना अलग स्टैंडअलोन सहायक शुरू करें',
    chooseProfile: 'अपनी घरेलू प्रोफाइल चुनें',
    chooseProfileSubtitle: 'हर प्रोफाइल के लिए बिल्कुल अलग और स्पष्ट अनुभव बिना किसी उलझन के',
    elderProfileTitle: 'वरिष्ठ नागरिक एवं बुजुर्ग देखभाल (Elder Care)',
    elderProfileDesc: 'बड़े फॉन्ट, अलार्म घंटी, रोज़ाना कुशल-मंगल चेक-इन, दवाईयों का समय और 1-क्लिक व्हाट्सएप किराना ऑर्डर',
    elderProfileBadge: 'बुजुर्गों के अनुकूल',
    elderCaregiverHint: 'जुड़े हुए केयरगिवर: प्रिया (बेटी)',
    elderQuickLogin: 'एल्डर केयर मोड शुरू करें',
    hostelProfileTitle: 'हॉस्टल और फ्लैटमेट्स (Hostel Flatmates)',
    hostelProfileDesc: 'नो रूममेट झगड़ा: काम का रोटेशन, चाय-समोसा पेनल्टी जार, देर रात स्नैक्स लिस्ट और 1-क्लिक UPI QR कोड',
    hostelProfileBadge: 'फ्लैट B-302',
    hostelRoomHint: 'सक्रिय रूममेट्स: रोहन, विक्रम, अंकित',
    hostelQuickLogin: 'हॉस्टल फ्लैट मोड शुरू करें',
    familyProfileTitle: 'संयुक्त परिवार (Family Household)',
    familyProfileDesc: 'साझा किराना बोर्ड, AI फ्रिज स्कैनर, घरेलू कामों का फेयरनेस मीटर और बिजली-गैस बिल रिमाइंडर',
    familyProfileBadge: 'शर्मा परिवार',
    familyMembersHint: 'सदस्य: पापा, मम्मी, आरव',
    familyQuickLogin: 'फैमिली होम मोड शुरू करें',
    loginButton: 'स्टैंडअलोन मोड में जाएं',
    switchLanguageNotice: 'शीर्ष पट्टी से कभी भी अपनी भाषा बदल सकते हैं',

    // Camera Banner
    cameraBannerTitleElder: 'AI कैमरा से फ्रिज और किचन स्कैन करें',
    cameraBannerTitleHostel: 'AI फ्रिज और आधी रात डब्बा स्कैनर',
    cameraBannerTitleFamily: 'मल्टीमॉडल AI फ्रिज और स्टील डब्बा स्कैनर',
    cameraBannerSubtitle: 'लाइव कैमरा से सामान स्कैन करें, कमी पहचानें और स्टील के डिब्बे याद रखें',

    // Elder View
    elderGreeting: 'नमस्ते! आज आप कैसा महसूस कर रहे हैं?',
    caregiverConnected: 'केयरगिवर जुड़ा हुआ है: प्रिया (बेटी) • नियमित अपडेट सक्रिय',
    dailyCheckinTitle: 'दैनिक चेक-इन: "मैं बिल्कुल ठीक हूँ"',
    dailyCheckinDone: '✓ चेक-इन पूरा हुआ! सब मंगल है',
    dailyCheckinDesc: 'रोज सुबह यह बड़ा बटन दबाएं ताकि परिवार को पता चल सके कि आप सुरक्षित और स्वस्थ हैं।',
    dailyCheckinDoneDesc: 'प्रिया (बेटी) को सुबह सूचित कर दिया गया कि आप उठ गए हैं और बिल्कुल स्वस्थ हैं।',
    iAmDoingWellBtn: 'मैं बिल्कुल ठीक हूँ!',
    familyNotified: 'परिवार को आज सूचना भेजी जा चुकी है',
    elderTodosTitle: 'मेरी दैनिक दिनचर्या और अलार्म (To-Do Checklist)',
    elderTodosSubtitle: 'दवाइयों, टहलने और ब्लड प्रेशर के लिए स्वचालित घंटी और आवाज़ से रिमाइंडर',
    todaysProgress: 'आज की प्रगति',
    addRoutinePlaceholder: 'नया कार्य जोड़ें (उदा. शाम की सैर, किताब पढ़ना)...',
    addRoutineBtn: 'कार्य जोड़ें',
    routineNotificationCenter: 'दैनिक अलार्म व नोटिफिकेशन केंद्र',
    systemPushActive: '✓ सिस्टम पुश सक्रिय',
    enableBrowserPush: '🔔 नोटिफिकेशन चालू करें',
    soundVoiceOn: 'घंटी व आवाज़: चालू',
    soundVoiceMuted: 'मौन (Muted)',
    testAlarmBtn: 'अलार्म टेस्ट करें',
    elderKiranaTitle: 'मेरी किराना और दैनिक ज़रूरतें (Kirana List)',
    elderKiranaSubtitle: 'सामान बाकी • शर्मा जी किराना को व्हाट्सएप भेजें या Zepto से मंगाएं',
    sendToKiranaWhatsApp: 'किराना को भेजें (WhatsApp)',
    readListBtn: 'लिस्ट बोलकर सुनाएं',
    quickStaplesHeader: '1-टैप ताज़ा ज़रूरतें (Quick Essentials):',
    addKiranaPlaceholder: 'किराना सामान लिखें (उदा. आटा 5kg, डोलो 650, केला)...',
    addItemBtn: 'सामान जोड़ें',
    hideQuickCommerce: 'क्विक कॉमर्स छिपाएं',
    showQuickCommerceElder: '⚡ 10-मिनट डिलीवरी सुझाव देखें (Zepto / Blinkit)',
    medScheduleTitle: 'आज की दवाइयां (Prescriptions)',
    medScheduleSubtitle: 'खुराक ट्रैक करें और खत्म होने पर रीफिल अलर्ट पाएं',
    lowStockAlert: 'दवा खत्म होने वाली है',
    orderRefillBtn: 'रीफिल मंगाएं',
    refillAdded: '✓ रीफिल लिस्ट में जुड़ गया!',
    takeDoseBtn: 'दवा ले ली',
    skipDoseBtn: 'छोड़ें',
    takenToday: 'आज ले ली गई',

    // Hostel View
    hostelBannerTitle: 'हॉस्टल फ्लैटमेट ऑपरेटिंग केंद्र',
    hostelBannerSubtitle: 'कमरे में जीरो झगड़ा: काम का सही बंटवारा, देर रात का खाना और 1-टैप UPI QR कोड',
    examModeBtn: 'एग्जाम मोड',
    examModeActive: 'एग्जाम मोड सक्रिय (शांत वातावरण)',
    messMenuTitle: 'आज का हॉस्टल मेस मेनू',
    lunchLabel: 'दोपहर का खाना (12:30 - 2:30 PM)',
    dinnerLabel: 'रात का खाना (8:00 - 10:00 PM)',
    skipMessPrompt: 'क्या आज रात मेस का खाना पसंद नहीं आ रहा?',
    skipMessBtn: 'आज मेस खाना छोड़ें',
    skippingMessActive: '✓ आज मेस छोड़ रहे हैं',
    suggestedLateMeal: 'सस्ता नाश्ता सुझाव: मसालेदार अंडा भुर्जी टोस्ट • ₹28',
    budgetFriendlyBadge: '₹50 बजट फ्रेंडली',
    penaltyJarTitle: 'चाय-समोसा पेनल्टी जार',
    penaltyJarDesc: 'काम टालने पर ₹20 पेनल्टी जार में जुड़ते हैं। फ्लैट साफ रखें या चाय पार्टी दें!',
    weeklyBudgetTitle: 'फ्लैट का साप्ताहिक खर्च',
    weeklyBudgetDesc: 'साप्ताहिक बजट सीमा में से',
    choresRotaTitle: 'रूममेट काम रोटेशन और पेनल्टी',
    choresRotaSubtitle: 'घूमता हुआ काम बंटवारा ताकि किसी एक पर बर्तन धोने या सफाई का बोझ न पड़े',
    doneBtn: 'हो गया',
    skipPenaltyBtn: 'छोड़ें (+₹20)',
    choreCompletedBadge: 'पूरा हुआ',
    sharedExpensesTitle: 'रूममेट साझा खर्च और 1-टैप UPI QR',
    sharedExpensesSubtitle: 'फ्लैट का हर खर्च बराबर बांटें और GPay / PhonePe / Paytm से तुरंत भुगतान करें',
    addExpensePlaceholder: 'खर्च का नाम...',
    amountPlaceholder: '₹ कुल',
    addExpenseBtn: 'खर्च जोड़ें',
    payUpiBtn: 'UPI से दें (QR)',
    markSettledBtn: 'चुकता मार्क करें',
    midnightSnacksTitle: 'फ्लैटमेट आधी रात स्नैक्स और किराना लिस्ट',
    midnightSnacksSubtitle: 'सामान बाकी • Zepto (10m) / Blinkit (8m) से मंगाएं • 1-टैप में फ्लैट में बांटें',
    shareToFlatWhatsApp: 'फ्लैट व्हाट्सएप ग्रुप पर भेजें',
    quickSnacksHeader: '1-टैप हॉस्टल पसंदीदा (नाईट स्टडी फ्यूल):',
    addSnackPlaceholder: 'स्नैक या सामान लिखें (उदा. मैगी, ब्रेड, अंडे)...',
    splitInFlatBtn: 'फ्लैट में बांटें',

    // Family View
    familyBannerTitle: 'साझा पारिवारिक ऑपरेटिंग केंद्र',
    familyBannerSubtitle: 'लाइव साझा किराना सूची, काम का फेयरनेस मीटर और 1-क्लिक बिल भुगतान रिमाइंडर',
    sharedKiranaTitle: 'साझा किराना और घरेलू सामान सूची',
    sharedKiranaSubtitle: 'सामान खरीदने बाकी • सभी सदस्यों के साथ तुरंत सिंक',
    sendListWhatsApp: 'किराना स्टोर को व्हाट्सएप भेजें',
    copyForQuickCommerce: 'Blinkit / Zepto के लिए कॉपी करें',
    allCategories: 'सभी सामान',
    dairyCategory: 'दूध और अंडे',
    veggiesCategory: 'सब्ज़ियां',
    staplesCategory: 'अनाज व दालें',
    snacksCategory: 'नाश्ता और स्नैक्स',
    choreFairnessTitle: 'काम का फेयरनेस मीटर',
    choreFairnessSubtitle: 'इस हफ्ते किसने कितने काम संभाले',
    billsRechargeTitle: 'आगामी बिल और गैस सिलेंडर',
    billsRechargeSubtitle: '1-क्लिक भुगतान रिमाइंडर और स्थिति ट्रैकिंग',
    markPaidBtn: 'भुगतान मार्क करें',
    paidBadge: 'भुगतान पूर्ण ✓',

    // Quick Commerce Hub
    qcTitle: 'क्विक कॉमर्स तुरंत डिलीवरी और उत्पाद सुझाव',
    qcSubtitle: 'Zepto (10 मिनट), Blinkit (8 मिनट) और Swiggy Instamart (11 मिनट) से लाइव मिलान',
    zeptoDelivery: 'Zepto डिलीवरी',
    blinkitDelivery: 'Blinkit डिलीवरी',
    localKiranaStore: 'स्थानीय किराना दुकान',
    zeptoEta: '10 मिनट',
    blinkitEta: '8 मिनट',
    instamartEta: '11 मिनट',
    addToCartBtn: 'लिस्ट में जोड़ें',
    addedBtn: 'जुड़ गया ✓',
    allFilter: 'सभी उत्पाद',
    elderFilter: 'बुजुर्ग स्वास्थ्य',
    hostelFilter: 'हॉस्टल स्नैक्स',
    familyFilter: 'पारिवारिक किराना',

    // Auth & Accounts
    signInTab: 'साइन इन करें',
    joinHouseholdTab: 'घर / फ्लैट से जुड़ें',
    createHouseholdTab: 'नया खाता बनाएं',
    usernameLabel: 'यूज़रनेम / आईडी',
    passwordLabel: 'पासवर्ड',
    householdCodeLabel: 'हाउसहोल्ड एक्सेस कोड',
    adminRoleBadge: 'मुख्य यूज़र (एडमिन)',
    memberRoleBadge: 'रूममेट / सदस्य',
    switchAccount: 'खाता बदलें / लॉगआउट',
    copyHouseholdCode: 'कोड शेयर करें',
    codeCopied: 'कोड कॉपी हो गया!',
    demoAccounts: '1-क्लिक डेमो खाते',
    loginErrorMsg: 'गलत यूज़रनेम या पासवर्ड। कृपया पुनः प्रयास करें।',
    householdNotFoundMsg: 'हाउसहोल्ड कोड नहीं मिला। कृपया मुख्य यूज़र से कोड जांचें।',

    // Splitwise
    splitwiseTitle: 'हॉस्टल स्प्लिटवाइज़ और खर्च विभाजन',
    splitwiseSubtitle: 'फ्लैट के सभी खर्चों का हिसाब रखें, कौन किसे कितना देगा और 1-क्लिक UPI QR से चुकता करें',
    totalFlatSpend: 'कुल फ्लैट खर्च',
    youAreOwed: 'आपको मिलेंगे',
    youOwe: 'आपको देने हैं',
    allSettledNotice: '✓ सभी हिसाब चुकता! कोई बकाया नहीं',
    settleUpBtn: 'चुकता करें (UPI QR)',
    recordSettlement: 'भुगतान दर्ज करें',
    splitEqually: 'बराबर बांटें',
    customSplit: 'अपनी पसंद से बांटें',
    paidByLabel: 'किसने भुगतान किया',
    splitWithLabel: 'किनके साथ बांटें',
    payerPlaceholder: 'चुने किसने दिया...',
    whoPaid: 'किसने खर्च किया?',

    // Edit Grocery Item
    editItem: 'संपादित करें',
    editItemTitle: 'सामान व मात्रा बदलें',
    itemQuantity: 'मात्रा',
    itemUnit: 'इकाई',
    saveBtn: 'सहेजें',
    cancelBtn: 'रद्द करें',

    // Family Chores & AI suggestions
    familyChoresTitle: 'पारिवारिक घरेलू काम व ज़िम्मेदारी हब',
    familyChoresSubtitle: 'हर सदस्य के लिए सौंपे गए काम, निष्पक्षता मीटर और स्मार्ट AI सुझाव',
    assignedTo: 'किसे सौंपा गया',
    addChoreBtn: 'काम जोड़ें',
    addChorePlaceholder: 'नया काम लिखें (जैसे: पौधों को पानी, कपड़े तह करना)...',
    aiSuggestChores: '✨ AI नए काम सुझाए',
    refreshChores: 'काम रीसेट करें',
    choreCompleted: 'पूर्ण ✓',
    chorePending: 'बाकी है',
    aiSuggestHostelChore: '✨ AI फ्लैट के काम सुझाए',
  },

  bn: {
    // Brand & Common
    appName: 'হোমমেট AI OS',
    tagline: 'বাড়ি ও ফ্ল্যাটের জন্য আধুনিক অ্যাডাপ্টিভ অপারেটিং সিস্টেম',
    deviceCameraLive: 'ডিভাইস ক্যামেরা চালু',
    openFridgeCamera: 'AI ফ্রিজ ক্যামেরা খুলুন',
    widgets: 'উইজেট',
    switchProfile: 'প্রোফাইল পরিবর্তন',
    logout: 'মোড থেকে বের হন',
    undo: 'পূর্বাবস্থায় ফেরান (Undo)',
    addedToList: 'মুদি তালিকায় যোগ করা হয়েছে',
    completed: 'সম্পন্ন',
    pending: 'বাকি',
    statusSettled: 'পরিশোধিত',
    allOk: 'সব ঠিক আছে',
    readAloud: 'পড়ে শোনান',
    searchPlaceholder: 'সামগ্রী, শাকসবজি, স্ন্যাক্স খুঁজুন...',

    // Login & Setup
    loginTitle: 'হোমমেট AI OS-এ স্বাগতম',
    loginSubtitle: 'আপনার পছন্দসই পরিবেশ নির্বাচন করুন এবং নিজের ডেডিকেটেড সহকারী উপভোগ করুন',
    chooseProfile: 'আপনার ঘরোয়া পরিবেশ নির্বাচন করুন',
    chooseProfileSubtitle: 'প্রতিটি পরিবেশ সম্পূর্ণ আলাদা ও স্ট্যান্ডঅ্যালোন যাতে কোনো গোলমাল না হয়',
    elderProfileTitle: 'প্রবীণ যত্ন ও সিনিয়র লিভিং (Elder Care)',
    elderProfileDesc: 'বড় ফন্ট, স্পষ্ট বোতাম, দৈনিক সুস্থতা চেক-ইন, অ্যালার্ম ঘণ্টা, ওষুধের রুটিন ও ১-ক্লিক হোয়াটসঅ্যাপ মুদি অর্ডার',
    elderProfileBadge: 'প্রবীণদের উপযোগী',
    elderCaregiverHint: 'যুক্ত আছেন: প্রিয়া (মেয়ে)',
    elderQuickLogin: 'এল্ডার কেয়ার মোড চালু করুন',
    hostelProfileTitle: 'হোস্টেল ও মেস ফ্ল্যাটমেট (Hostel Flatmates)',
    hostelProfileDesc: 'রুমমেটদের মধ্যে ঝামেলাহীন: কাজের রোটেশন, চা-শিঙাড়া পেনাল্টি ফান্ড, মধ্যরাতের স্ন্যাক্স ও ১-ট্যাপ UPI QR স্প্লিট',
    hostelProfileBadge: 'ফ্ল্যাট B-302',
    hostelRoomHint: 'রুমমেট: রোহন, বিক্রম, অঙ্কিত',
    hostelQuickLogin: 'হোস্টেল ফ্ল্যাট মোড চালু করুন',
    familyProfileTitle: 'যৌথ পরিবার (Family Household)',
    familyProfileDesc: 'শেয়ার্ড মুদি তালিকা, AI ফ্রিজ স্ক্যানার, বাড়ির কাজের ফেয়ারনেস মিটার এবং মাসিক বিল রিমাইন্ডার',
    familyProfileBadge: 'শর্মা পরিবার',
    familyMembersHint: 'সদস্য: বাবা, মা, আরভ',
    familyQuickLogin: 'ফ্যামিলি হোম মোড চালু করুন',
    loginButton: 'স্ট্যান্ডঅ্যালোন মোডে প্রবেশ করুন',
    switchLanguageNotice: 'উপরের বার থেকে যেকোনো সময় ভাষা পরিবর্তন করতে পারেন',

    // Camera Banner
    cameraBannerTitleElder: 'AI ক্যামেরা দিয়ে ফ্রিজ ও রান্নাঘর স্ক্যান করুন',
    cameraBannerTitleHostel: 'AI ফ্রিজ ও মাঝরাতের কৌটো স্ক্যানার',
    cameraBannerTitleFamily: 'মাল্টিমোডাল AI ফ্রিজ ও স্টিলের কৌটো স্ক্যানার',
    cameraBannerSubtitle: 'লাইভ ক্যামেরা দিয়ে জিনিস স্ক্যান করুন, শেষ হওয়া সামগ্রী চিহ্নিত করুন',

    // Elder View
    elderGreeting: 'নমস্কার! আজ কেমন অনুভব করছেন?',
    caregiverConnected: 'কেয়ারগিভার যুক্ত আছেন: প্রিয়া (মেয়ে) • নিয়মিত আপডেট সক্রিয়',
    dailyCheckinTitle: 'দৈনিক চেক-ইন: "আমি ভালো আছি"',
    dailyCheckinDone: '✓ চেক-ইন সম্পন্ন! সব ঠিক আছে',
    dailyCheckinDesc: 'প্রতিদিন সকালে এই বড় বোতামটিতে চাপ দিন যাতে পরিবার জানতে পারে আপনি সুস্থ আছেন।',
    dailyCheckinDoneDesc: 'প্রিয়া (মেয়ে)-কে সকালে জানিয়ে দেওয়া হয়েছে যে আপনি উঠেছেন ও ভালো আছেন।',
    iAmDoingWellBtn: 'আমি ভালো আছি!',
    familyNotified: 'পরিবারকে আজ জানানো হয়েছে',
    elderTodosTitle: 'আমার দৈনিক রুটিন ও অ্যালার্ম (To-Do Checklist)',
    elderTodosSubtitle: 'ওষুধ, পায়চারি ও রক্তচাপ পরীক্ষার জন্য স্বয়ংক্রিয় ঘণ্টা এবং ভয়েস রিমাইন্ডার',
    todaysProgress: 'আজকের অগ্রগতি',
    addRoutinePlaceholder: 'নতুন রুটিন যোগ করুন (যেমন: বিকেলের হাঁটা, বই পড়া)...',
    addRoutineBtn: 'রুটিন যোগ করুন',
    routineNotificationCenter: 'রুটিন নোটিফিকেশন সেন্টার',
    systemPushActive: '✓ সিস্টেম পুশ চালু আছে',
    enableBrowserPush: '🔔 নোটিফিকেশন চালু করুন',
    soundVoiceOn: 'শব্দ ও ভয়েস: চালু',
    soundVoiceMuted: 'নিঃশব্দ (Muted)',
    testAlarmBtn: 'অ্যালার্ম পরীক্ষা করুন',
    elderKiranaTitle: 'আমার মুদি সামগ্রীর তালিকা (Kirana List)',
    elderKiranaSubtitle: 'সামগ্রী প্রয়োজন • স্থানীয় শর্মা জি দোকানে হোয়াটসঅ্যাপ পাঠান বা Zepto থেকে আনান',
    sendToKiranaWhatsApp: 'দোকানে পাঠান (WhatsApp)',
    readListBtn: 'তালিকা পড়ে শোনান',
    quickStaplesHeader: '১-ট্যাপ জরুরি সামগ্রী (Quick Essentials):',
    addKiranaPlaceholder: 'সামগ্রীর নাম লিখুন (যেমন: দুধ, কলা, বিস্কুট)...',
    addItemBtn: 'যোগ করুন',
    hideQuickCommerce: '১০-মিনিট ডেলিভারি বন্ধ রাখুন',
    showQuickCommerceElder: '⚡ ১০-মিনিট হোম ডেলিভারি সুপারিশ দেখুন (Zepto / Blinkit)',
    medScheduleTitle: 'আজকের ওষুধের রুটিন (Prescriptions)',
    medScheduleSubtitle: 'ওষুধের হিসাব রাখুন এবং শেষ হলে রিফিল অ্যালার্ট পান',
    lowStockAlert: 'ওষুধ কম আছে',
    orderRefillBtn: 'রিফিল অর্ডার দিন',
    refillAdded: '✓ তালিকায় যোগ করা হয়েছে!',
    takeDoseBtn: 'ওষুধ খেয়েছি',
    skipDoseBtn: 'বাদ দিন',
    takenToday: 'আজ নেওয়া হয়েছে',

    // Hostel View
    hostelBannerTitle: 'হোস্টেল ফ্ল্যাটমেট অপারেটিং সেন্টার',
    hostelBannerSubtitle: 'রুমমেটদের মধ্যে ঝামেলাহীন: সঠিক কাজের বণ্টন, রাতের খাবার ও ১-ট্যাপ UPI QR স্প্লিট',
    examModeBtn: 'পরীক্ষা মোড',
    examModeActive: 'পরীক্ষা মোড চালু (নীরব পরিবেশ)',
    messMenuTitle: 'আজকের মেস মেনু',
    lunchLabel: 'দুপুরের খাবার (১২:৩০ - ২:৩০)',
    dinnerLabel: 'রাতের খাবার (৮:০০ - ১০:০০)',
    skipMessPrompt: 'আজ মেসের খাবার ভালো লাগছে না?',
    skipMessBtn: 'আজ মেস ছাড়ুন',
    skippingMessActive: '✓ আজ মেস খাওয়া বাদ দেওয়া হয়েছে',
    suggestedLateMeal: 'সহজ খাবারের সুপারিশ: ঝাল ডিম ভুরজি টোস্ট • ₹২৮',
    budgetFriendlyBadge: '₹৫০ সাশ্রয়ী বাজেট',
    penaltyJarTitle: 'চা ও শিঙাড়া পেনাল্টি জার',
    penaltyJarDesc: 'কাজ ফাঁকি দিলে পেনাল্টি ফান্ডে ₹২০ জমা হবে। ফ্ল্যাট পরিষ্কার রাখুন বা চায়ের বিল দিন!',
    weeklyBudgetTitle: 'ফ্ল্যাটের সাপ্তাহিক খরচ',
    weeklyBudgetDesc: 'সাপ্তাহিক বাজেট সীমা থেকে',
    choresRotaTitle: 'রুমমেট কাজের রোটেশন ও পেনাল্টি',
    choresRotaSubtitle: 'ঘূর্ণায়মান কাজের বণ্টন যাতে একার উপর বাসন ধোয়া বা ঝাড়ুর চাপ না পড়ে',
    doneBtn: 'হয়েছে',
    skipPenaltyBtn: 'বাদ দিন (+₹২০)',
    choreCompletedBadge: 'সম্পন্ন',
    sharedExpensesTitle: 'রুমমেটদের যৌথ খরচ ও ১-ট্যাপ UPI QR',
    sharedExpensesSubtitle: 'ফ্ল্যাটের সব খরচ সমান ভাগে ভাগ করুন এবং GPay / PhonePe দিয়ে চটজলদি মেটান',
    addExpensePlaceholder: 'খরচের বিবরণ...',
    amountPlaceholder: '₹ মোট টাকা',
    addExpenseBtn: 'খরচ যোগ করুন',
    payUpiBtn: 'UPI দিন (QR)',
    markSettledBtn: 'পরিশোধিত করুন',
    midnightSnacksTitle: 'ফ্ল্যাটমেট মধ্যরাতের স্ন্যাক্স ও মুদি তালিকা',
    midnightSnacksSubtitle: 'সামগ্রী প্রয়োজন • Zepto (10m) / Blinkit (8m) ডেলিভারি • ১-ট্যাপে ফ্ল্যাটে ভাগ করুন',
    shareToFlatWhatsApp: 'ফ্ল্যাট হোয়াটসঅ্যাপে পাঠান',
    quickSnacksHeader: '১-ট্যাপ হোস্টেল স্পেশাল (Late Night Fuel):',
    addSnackPlaceholder: 'স্ন্যাক্স বা জিনিস লিখুন (ম্যাগি, ডিম, ব্রেড)...',
    splitInFlatBtn: 'ফ্ল্যাটে ভাগ করুন',

    // Family View
    familyBannerTitle: 'যৌথ পারিবারিক অপারেটিং সেন্টার',
    familyBannerSubtitle: 'শেয়ার্ড মুদি তালিকা, কাজের ফেয়ারনেস মিটার এবং মাসিক বিলের রিমাইন্ডার',
    sharedKiranaTitle: 'শেয়ার্ড মুদি ও নিত্যপ্রয়োজনীয় সামগ্রী',
    sharedKiranaSubtitle: 'সামগ্রী কেনা বাকি • পরিবারের সবার সাথে মুহূর্তে সিঙ্ক',
    sendListWhatsApp: 'দোকানদারকে হোয়াটসঅ্যাপে পাঠান',
    copyForQuickCommerce: 'Blinkit / Zepto-র জন্য কপি করুন',
    allCategories: 'সব সামগ্রী',
    dairyCategory: 'দুধ ও ডিম',
    veggiesCategory: 'শাকসবজি',
    staplesCategory: 'চাল, ডাল ও তেল',
    snacksCategory: 'স্ন্যাক্স',
    choreFairnessTitle: 'কাজের ফেয়ারনেস মিটার',
    choreFairnessSubtitle: 'এই সপ্তাহে কে কত কাজ করেছে',
    billsRechargeTitle: 'আসন্ন বিল ও গ্যাস সিলিন্ডার',
    billsRechargeSubtitle: '১-ট্যাপ পেমেন্ট রিমাইন্ডার ও স্ট্যাটাস ট্র্যাকিং',
    markPaidBtn: 'পরিশোধ মার্ক করুন',
    paidBadge: 'পরিশোধিত ✓',

    // Quick Commerce Hub
    qcTitle: 'কুইক কমার্স চটজলদি ডেলিভারি ও সামগ্রী সুপারিশ',
    qcSubtitle: 'Zepto (১০ মিনিট), Blinkit (৮ মিনিট) ও Swiggy Instamart (১১ মিনিট) থেকে লাইভ স্টক',
    zeptoDelivery: 'Zepto ডেলিভারি',
    blinkitDelivery: 'Blinkit ডেলিভারি',
    localKiranaStore: 'স্থানীয় মুদি দোকান',
    zeptoEta: '১০ মিনিট',
    blinkitEta: '৮ মিনিট',
    instamartEta: '১১ মিনিট',
    addToCartBtn: 'তালিকায় যোগ করুন',
    addedBtn: 'যুক্ত হয়েছে ✓',
    allFilter: 'সব সামগ্রী',
    elderFilter: 'প্রবীণ স্বাস্থ্য',
    hostelFilter: 'হোস্টেল স্ন্যাক্স',
    familyFilter: 'পারিবারিক বাজার',

    // Auth & Accounts
    signInTab: 'সাইন ইন করুন',
    joinHouseholdTab: 'পরিবারে যোগ দিন',
    createHouseholdTab: 'নতুন পরিবার তৈরি',
    usernameLabel: 'ব্যবহারকারীর নাম / আইডি',
    passwordLabel: 'পাসওয়ার্ড',
    householdCodeLabel: 'পরিবারের অ্যাক্সেস কোড',
    adminRoleBadge: 'প্রধান ইউজার (অ্যাডমিন)',
    memberRoleBadge: 'রুমমেট / সদস্য',
    switchAccount: 'অ্যাকাউন্ট বদলান / লগআউট',
    copyHouseholdCode: 'কোড শেয়ার করুন',
    codeCopied: 'কোড কপি হয়েছে!',
    demoAccounts: '১-ক্লিক ডেমো অ্যাকাউন্ট',
    loginErrorMsg: 'ভুল ইউজারনেম বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।',
    householdNotFoundMsg: 'পরিবারের কোড পাওয়া যায়নি। মূল ইউজারের থেকে সঠিক কোড নিন।',

    // Splitwise
    splitwiseTitle: 'ফ্ল্যাট স্প্লিটওয়াইজ ও খরচ বণ্টন',
    splitwiseSubtitle: 'রুমমেটদের যৌথ খরচের হিসাব রাখুন, কে কত পাবে বা দেবে দেখুন ও ১-ট্যাপ UPI QR দিয়ে মেটান',
    totalFlatSpend: 'মোট ফ্ল্যাট খরচ',
    youAreOwed: 'আপনি পাবেন',
    youOwe: 'আপনাকে দিতে হবে',
    allSettledNotice: '✓ সব হিসাব মেটানো হয়েছে! কোনো দেনা নেই',
    settleUpBtn: 'হিসাব মেটান (UPI QR)',
    recordSettlement: 'পেমেন্ট রেকর্ড করুন',
    splitEqually: 'সমান ভাগে ভাগ',
    customSplit: 'কাস্টম ভাগ',
    paidByLabel: 'কে টাকা দিয়েছে',
    splitWithLabel: 'কার কার সাথে ভাগ',
    payerPlaceholder: 'নির্বাচন করুন...',
    whoPaid: 'কে খরচ বহন করেছে?',

    // Edit Grocery Item
    editItem: 'সম্পাদনা করুন',
    editItemTitle: 'সামগ্রীর নাম ও পরিমাণ সম্পাদনা',
    itemQuantity: 'পরিমাণ',
    itemUnit: 'একক',
    saveBtn: 'সংরক্ষণ করুন',
    cancelBtn: 'বাতিল',

    // Family Chores & AI suggestions
    familyChoresTitle: 'পারিবারিক গৃহস্থালি কাজের হাব',
    familyChoresSubtitle: 'পরিবারের সদস্যদের মধ্যে কাজের বণ্টন, ফেয়ারনেস মিটার এবং AI পরামর্শ',
    assignedTo: 'দায়িত্বপ্রাপ্ত',
    addChoreBtn: 'কাজ যোগ করুন',
    addChorePlaceholder: 'নতুন কাজ লিখুন (যেমন: গাছে জল দেওয়া, কাপড় গোছানো)...',
    aiSuggestChores: '✨ AI কাজের পরামর্শ দিন',
    refreshChores: 'কাজ রিফ্রেশ করুন',
    choreCompleted: 'সম্পন্ন ✓',
    chorePending: 'বাকি',
    aiSuggestHostelChore: '✨ AI ফ্ল্যাটের কাজের পরামর্শ দিন',
  },
};
