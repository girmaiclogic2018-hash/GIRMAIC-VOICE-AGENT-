import { CompanyKnowledgeItem, CustomerInquiry } from './types';

export const INITIAL_KNOWLEDGE: CompanyKnowledgeItem[] = [
  {
    id: 'org-info',
    category: 'General',
    title: 'Organization Identity & Legal Status',
    contentEN: 'GIRMAIC AI TECHNOLOGY AND INNOVATION CENTER is an AI technology and innovation hub founded in Dire Dawa, Ethiopia by Girma Haile Bunaro.',
    contentAM: 'ጂርማይክ አይ አይ ቴክኖሎጂ ኤንድ ኢኖቬሽን ሴንተር በድሬዳዋ ኢትዮጵያ በኣቶ ግርማ ሃይሌ ቡናሮ የተመሰረተ የሰው ሰራሽ አስተውሎት ቴክኖሎጂ እና ፈጠራ ማዕከል ነው።'
  },
  {
    id: 'founder-info',
    category: 'Founder',
    title: 'Founder & Visionary',
    contentEN: 'Founder & Visionary: Girma Haile Bunaro. Based in Dire Dawa, Ethiopia. Leading the African Intelligence, Global Innovation, Human Progress mission.',
    contentAM: 'መሥራች እና ራዕይ መሪ፡ ግርማ ሃይሌ ቡናሮ። መኖሪያ፡ ድሬዳዋ፣ ኢትዮጵያ። የአፍሪካ አስተውሎት፣ ዓለም አቀፍ ፈጠራ፣ የሰው ልጅ እድገት መሪ።'
  },
  {
    id: 'location-contact',
    category: 'Contact',
    title: 'Location & Official Contact',
    contentEN: 'Location: Dire Dawa, Ethiopia. Email: girmaiclogic2018@gmail.com. Contact Phone: +251982422266.',
    contentAM: 'አድራሻ፡ ድሬዳዋ፣ ኢትዮጵያ። ኢሜይል፡ girmaiclogic2018@gmail.com። ስልክ፡ +251982422266።'
  },
  {
    id: 'tagline',
    category: 'General',
    title: 'Brand Tagline',
    contentEN: 'AFRICAN INTELLIGENCE. GLOBAL INNOVATION. HUMAN PROGRESS.',
    contentAM: 'የአፍሪካ አስተውሎት። ዓለም አቀፍ ፈጠራ። የሰው ልጅ እድገት።'
  },
  {
    id: 'services',
    category: 'Services',
    title: 'Focus Areas & Capabilities',
    contentEN: 'Key focus areas include Humanoid Robot AI Voice Interfaces, Multilingual Amharic/English Voice Automation, Technology Trading, and Enterprise AI Integration.',
    contentAM: 'ዋና ዋና የሥራ ዘርፎች፡ የድምፅ ረዳት ሰው ሰራሽ አስተውሎት፣ የአማርኛ እና እንግሊዝኛ ድምፅ ቴክኖሎጂ፣ የቴክኖሎጂ ንግድ እና የኢንተርፕራይዝ AI ማቀናጀት።'
  }
];

export const INITIAL_TEST_INQUIRIES: CustomerInquiry[] = [
  {
    id: 'inq-101',
    name: 'Abebe Kebede',
    contact: '+251911223344',
    businessInterest: 'Partnership',
    message: 'Interested in partnering with GIRMAIC AI for automated voice customer service in Ethiopia.',
    timestamp: '2026-11-06T10:00:00.000Z',
    status: 'In Progress'
  },
  {
    id: 'inq-102',
    name: 'Sarah Williams',
    contact: 'sarah.w@globaltech.org',
    businessInterest: 'Services',
    message: 'We would like to consult on installing GIRMAIC Amharic voice processing for our regional logistics center.',
    timestamp: '2026-11-08T05:00:00.000Z',
    status: 'New'
  }
];
