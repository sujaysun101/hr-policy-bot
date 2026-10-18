export type HandbookSection = {
  sectionNumber: string
  sectionTitle: string
  page: number
  content: string
}

export const SAMPLE_HANDBOOK_TITLE = "Cedar & Pine Employee Handbook"
export const SAMPLE_HANDBOOK_FILE = "Cedar-and-Pine-Employee-Handbook-2026.pdf"

export const HANDBOOK_SECTIONS: HandbookSection[] = [
  {
    sectionNumber: "1.1",
    sectionTitle: "Welcome",
    page: 2,
    content:
      "Cedar & Pine makes outdoor apparel from a studio at 418 NW Industrial Way, Bend, Oregon. This handbook applies to every employee of Cedar & Pine LLC. It is the internal source for policy questions. It is not an employment contract. If a sentence here conflicts with a written offer letter or a benefit plan document, the offer letter or the plan document wins, and the People team will say which one applies. The edition date is January 6, 2026. It replaces the 2025 handbook.",
  },
  {
    sectionNumber: "1.2",
    sectionTitle: "Who we are",
    page: 2,
    content:
      "Cedar & Pine is a 25-person company. Design and product is 7 people. Wholesale and retail is 5. Operations and shipping is 6. Customer care is 4. Finance and people is 3. Avery Chen, People Lead, owns this handbook. Ask Liam first. If the handbook is silent, Liam sends the question to the People team. We revise a section when the same gap shows up more than once. The founder has the only signature that can change at-will employment, and only in a written agreement that names the person it covers.",
  },
  {
    sectionNumber: "1.3",
    sectionTitle: "How to use this handbook",
    page: 3,
    content:
      "Sections are numbered. An answer should name the section number and the section title, not a paraphrase with no source. Policies in this edition are effective January 6, 2026. The People team announces a change in the people channel and replaces the PDF the same week. If you are holding a printed copy, check the edition date on the first page before you rely on it.",
  },
  {
    sectionNumber: "2.1",
    sectionTitle: "At-will employment",
    page: 4,
    content:
      "Employment at Cedar & Pine is at will. Either you or the company may end employment at any time, with or without cause, and with or without notice. Nothing in this handbook, and no spoken promise from a manager, changes at-will employment. Only a written agreement signed by the founder, naming the employee it covers, can change that status.",
  },
  {
    sectionNumber: "2.2",
    sectionTitle: "Employee classifications",
    page: 4,
    content:
      "Exempt employees are paid a salary and are not eligible for overtime. Non-exempt employees are paid hourly and earn overtime as described in section 3.4. Full-time means 30 or more scheduled hours a week. Part-time means under 30 scheduled hours a week. Temporary employees are hired for a stated season or project. Your offer letter states your classification. If you think it is wrong, email the People team.",
  },
  {
    sectionNumber: "2.3",
    sectionTitle: "Equal opportunity and accommodation",
    page: 5,
    content:
      "Cedar & Pine does not discriminate in hiring, pay, promotion, or termination on the basis of race, color, religion, sex, sexual orientation, gender identity, national origin, age, disability, veteran status, marital status, or any other status protected by Oregon or federal law. We provide reasonable accommodations for disability and for sincerely held religious practice. Request an accommodation from Avery Chen. Medical details stay with the People team and are not shared with your manager beyond what the accommodation itself requires.",
  },
  {
    sectionNumber: "2.4",
    sectionTitle: "Introductory period",
    page: 5,
    content:
      "The first 90 calendar days are an introductory period. It is time for you and your manager to check fit, tools, and expectations. Your manager holds a check-in at day 30 and day 80. Benefits that have their own waiting period are described in those sections. The introductory period does not change at-will employment, and finishing it is not a promise of continued employment.",
  },
  {
    sectionNumber: "3.1",
    sectionTitle: "Studio hours and core days",
    page: 6,
    content:
      "The Bend studio is open Monday through Friday, 8:00 a.m. to 5:30 p.m. Pacific time. Core collaboration hours are 10:00 a.m. to 3:00 p.m. Pacific on Tuesday and Thursday. Full-time employees are expected in the studio on those two core days unless their offer letter says the role is fully remote, or they are out on approved leave. A standard full-time schedule is 40 hours a week.",
  },
  {
    sectionNumber: "3.2",
    sectionTitle: "Hybrid and remote work",
    page: 7,
    content:
      "Most roles are hybrid: Tuesday and Thursday in the Bend studio, and the other days remote from a home workspace in an approved state. Fully remote roles are labeled remote in the offer letter. Remote work is from a fixed home address. A cafe is not your regular office. You need reliable internet and a private place for calls. Cedar & Pine does not pay for home internet. The one-time home office stipend is in section 6.3.",
  },
  {
    sectionNumber: "3.3",
    sectionTitle: "Working outside Oregon",
    page: 7,
    content:
      "You may regularly work from Oregon, Washington, California, or Idaho. Any other U.S. state, and any time outside the United States, needs written approval from the People team before you work there. Approval is required when you will be outside an approved state for more than 10 business days in a calendar year. We decline requests when payroll registration or export rules make the location impractical. A short trip inside an approved state is fine if your manager knows and the total stays under 10 business days. This section is about where you perform your job. It is not a relocation benefit.",
  },
  {
    sectionNumber: "3.4",
    sectionTitle: "Overtime",
    page: 8,
    content:
      "Non-exempt employees earn 1.5 times their regular hourly rate for hours worked over 40 in a workweek. The workweek runs Sunday through Saturday. Overtime must be approved by your manager before you work it, except when a shipment or a studio emergency makes prior approval impossible. In that case, tell your manager the next business day. Exempt employees do not earn overtime. Cedar & Pine does not offer compensatory time off in place of overtime pay for non-exempt staff.",
  },
  {
    sectionNumber: "3.5",
    sectionTitle: "Meal and rest breaks",
    page: 8,
    content:
      "Non-exempt employees take a paid 10-minute rest break for every four hours worked, and an unpaid meal break of at least 30 minutes when the shift is six hours or longer. Meal breaks are duty-free. Do not spend the meal break at your desk while watching a shipping queue. Exempt employees should step away for a meal. Those breaks are not clocked.",
  },
  {
    sectionNumber: "4.1",
    sectionTitle: "Paid time off",
    page: 9,
    content:
      "Employees sometimes call this vacation. Full-time employees receive 18 days, which is 144 hours, of paid time off per calendar year. Paid time off accrues at 1.5 days, or 12 hours, per month, starting on the first of the month after your start date. You may use paid time off after 30 days of employment. The carryover cap is 27 days, or 216 hours. Once you hit the cap, accrual pauses until you take time off. Part-time employees accrue paid time off in proportion to their scheduled hours. Request paid time off in the HRIS at least 5 business days ahead for one or two days, and at least 15 business days ahead for three or more days. Your manager approves based on coverage. We do not pay out unused paid time off during employment. Unused accrued paid time off is paid on separation under section 10.2.",
  },
  {
    sectionNumber: "4.2",
    sectionTitle: "Holidays",
    page: 10,
    content:
      "Cedar & Pine observes 10 paid holidays: New Year's Day, Martin Luther King Jr. Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Thanksgiving Day, the Friday after Thanksgiving, Christmas Eve, and Christmas Day. When a holiday falls on Saturday, we observe it on Friday. When it falls on Sunday, we observe it on Monday. A holiday is paid at your regular rate for your usual scheduled hours and does not count as hours worked for overtime. If the company asks you to work a holiday, you receive a substitute day off within 30 days.",
  },
  {
    sectionNumber: "4.3",
    sectionTitle: "Sick time",
    page: 11,
    content:
      "Oregon sick time is separate from paid time off. Full-time employees receive 40 hours of sick time on January 1, or on the date of hire for a new employee. Sick time does not roll over. You may use it for your own illness, a family member's illness, preventive care, or reasons covered by Oregon sick time law, including domestic violence, harassment, sexual assault, or stalking. You do not need a doctor's note for an absence under three consecutive scheduled days. Notify your manager before your shift, or as soon as you can. Sick time is not paid out when employment ends.",
  },
  {
    sectionNumber: "4.4",
    sectionTitle: "Bereavement leave",
    page: 11,
    content:
      "You may take up to 5 paid days for the death of a spouse, domestic partner, child, parent, sibling, grandparent, or grandchild, including those relationships through marriage, adoption, or foster care. You may take up to 2 paid days for the death of an extended family member or a close friend. Tell your manager as soon as you can. The days do not have to be consecutive. If you need more time, you may use paid time off or unpaid leave.",
  },
  {
    sectionNumber: "4.5",
    sectionTitle: "Parental leave",
    page: 12,
    content:
      "After 6 months of employment, a parent who gives birth, adopts a child, or welcomes a foster placement receives 12 weeks of paid parental leave. A parent who is not the birthing parent receives 6 weeks of paid parental leave for the same events. Pay is 100 percent of regular base pay. Leave is taken within 12 months of the birth or placement and may be split into two blocks. Tell the People team at least 30 days before a foreseeable leave. This paid leave runs concurrently with Oregon Family Leave Act or federal FMLA leave when those laws apply. Health coverage continues during paid parental leave on the same terms as when you are working.",
  },
  {
    sectionNumber: "4.6",
    sectionTitle: "Jury duty and witness leave",
    page: 13,
    content:
      "Cedar & Pine pays your regular wages for jury duty, or for appearing as a subpoenaed witness, for up to 10 business days per calendar year. Give your manager the summons within 3 business days of receiving it. If the court releases you early and more than half the workday remains, you return to work. Court pay is yours to keep.",
  },
  {
    sectionNumber: "4.7",
    sectionTitle: "Leave without pay",
    page: 13,
    content:
      "Personal leave without pay may be granted for up to 30 days when paid time off and any statutory leave are exhausted. Your manager and the People team both approve it in writing. Benefits continue for those 30 days if you pay your usual premium share. A longer leave is decided case by case and is not guaranteed. We follow the Oregon Family Leave Act and the FMLA when you are eligible. The People team confirms eligibility. This summary does not replace those statutes.",
  },
  {
    sectionNumber: "5.1",
    sectionTitle: "Paydays",
    page: 14,
    content:
      "Employees are paid semi-monthly, on the 15th and on the last business day of the month. If a payday falls on a weekend or a company holiday, we pay on the business day before. Pay is by direct deposit. Hourly employees submit hours in the HRIS every other Friday by noon Pacific. A late time card is paid on the following payday. Pay stubs live in the HRIS. Questions about a missing amount go to finance within 10 business days of that payday.",
  },
  {
    sectionNumber: "5.2",
    sectionTitle: "Business expenses",
    page: 15,
    content:
      "A company purchase needs a receipt at $25 and above. Under $25, a note in the expense tool with the vendor and the purpose is enough. Your manager approves expenses. Anything over $300 also needs Finance approval before you spend it, unless it is a pre-approved inventory or freight invoice. Submit expenses within 30 days. Approved expenses are reimbursed on the next payday after approval. Personal expenses, traffic tickets, and alcohol are not reimbursed, except a modest amount of alcohol at a pre-approved client dinner. A $40 team lunch needs a receipt because it is over $25. The company card is for software, freight, and studio supplies, not for personal use.",
  },
  {
    sectionNumber: "5.3",
    sectionTitle: "Travel",
    page: 16,
    content:
      "Business travel outside Bend needs manager approval before you book. We reimburse coach airfare, reasonable lodging, and ground transport. Meals while traveling are reimbursed up to $70 per full day: $15 for breakfast, $20 for lunch, and $35 for dinner, with receipts. We do not reimburse the minibar, movies, or an airline seat upgrade. Book at least 14 days ahead when the trip is foreseeable. This section covers a business trip. It does not pay for a house move or a relocation.",
  },
  {
    sectionNumber: "6.1",
    sectionTitle: "Medical, dental, and vision",
    page: 17,
    content:
      "Full-time employees may join the company medical, dental, and vision plans on the first of the month after 30 days of employment. Cedar & Pine pays 90 percent of the employee-only medical premium and 70 percent of the extra premium to cover a spouse, domestic partner, or children. Dental and vision premiums are paid 100 percent for the employee and 50 percent for dependents. Deductibles, carriers, and exclusions are in the benefits guide. If this summary and the guide disagree, the guide controls. Part-time employees scheduled for 20 or more hours a week may join medical by paying the full premium.",
  },
  {
    sectionNumber: "6.2",
    sectionTitle: "Retirement plan",
    page: 18,
    content:
      "Full-time employees may join the 401(k) plan on the first of the month after 90 days of employment. Cedar & Pine matches 100 percent of your contribution, up to 3 percent of eligible pay. The match is deposited each payday. You are fully vested in your own contributions and in the company match from the day they are deposited. The plan document controls investments and loans. Cedar & Pine does not offer a pension.",
  },
  {
    sectionNumber: "6.3",
    sectionTitle: "Learning, wellness, and home office stipends",
    page: 18,
    content:
      "Full-time employees receive a $600 learning stipend per calendar year for a course, a book, or a conference ticket related to their craft. The learning stipend does not cover college tuition or graduate tuition, and it does not roll over. A $40 monthly wellness stipend may be used for fitness, an outdoor trip, or a studio class. New full-time employees also receive a one-time $250 home office stipend for a chair, a lamp, or a similar setup item. Submit that receipt within 90 days of the start date. Stipends are reimbursed through the expense tool. None of these stipends is a bike, parking, or commuting allowance.",
  },
  {
    sectionNumber: "7.1",
    sectionTitle: "Code of conduct",
    page: 19,
    content:
      "Treat coworkers, makers, retailers, and customers with respect. Do the work you committed to, tell the truth about a delay, and keep the studio and the warehouse safe. A manager does not ask anyone to violate this handbook. If that happens, tell the People team. Repeated no-call no-shows, theft, harassment, or falsifying time or expenses can end employment immediately.",
  },
  {
    sectionNumber: "7.2",
    sectionTitle: "Harassment and discrimination",
    page: 20,
    content:
      "Harassment based on a protected characteristic is prohibited. That includes slurs, jokes, unwanted sexual attention, and displaying offensive images. Sexual harassment includes unwelcome advances, requests for sexual favors, and other verbal or physical conduct of a sexual nature. A person can harass someone of any gender. The rule covers employees, contractors, and visitors. If you are told that your conduct is unwelcome, stop.",
  },
  {
    sectionNumber: "7.3",
    sectionTitle: "How to report a concern",
    page: 20,
    content:
      "Report harassment, discrimination, or retaliation to your manager, or directly to Avery Chen at the People team. You may also leave a written note in the People mailbox at the studio. Cedar & Pine does not retaliate against anyone who reports a concern in good faith or who participates in an investigation. Avery reviews the report, or an outside investigator does when Avery is the subject, and follows up with the person who reported it. You will not be promised a particular discipline outcome. If you believe you are in immediate danger, call 911 first.",
  },
  {
    sectionNumber: "7.4",
    sectionTitle: "Conflicts of interest",
    page: 21,
    content:
      "Do not take a second job, or a side project, with a competitor, a supplier we are negotiating with, or a retailer who carries our line, unless the People team approves it in writing. Do not accept a gift over $50 from a vendor. An ordinary business meal is fine. If you are unsure, ask before you accept. A small personal outdoor project that does not use company time, designs, or suppliers is allowed. Tell your manager so it is not a surprise.",
  },
  {
    sectionNumber: "7.5",
    sectionTitle: "Alcohol, cannabis, and other drugs",
    page: 21,
    content:
      "Do not work while impaired by alcohol, cannabis, or illegal drugs. Cannabis is legal in Oregon and is still not allowed during work time, or on the studio or warehouse floor, including in a personal vehicle on our lot during a shift. Alcohol at a company event is optional. Do not drink and then drive. We will pay for a ride home from a company event. Prescription medication is allowed when you can work safely. Tell the People team if a medication requires an accommodation.",
  },
  {
    sectionNumber: "8.1",
    sectionTitle: "Studio and warehouse safety",
    page: 22,
    content:
      "The warehouse and the cutting table have the highest injury risk. Closed-toe shoes are required in the warehouse. Report a hazard to the studio manager the same day. Do not block a fire exit with freight. A visitor on the floor wears a badge and stays with their host. An accident, including a near miss with the forklift, is written up the same day.",
  },
  {
    sectionNumber: "8.2",
    sectionTitle: "Workers' compensation",
    page: 22,
    content:
      "Cedar & Pine carries workers' compensation insurance. Report a work injury to your manager and the People team as soon as you are safe, and always within 24 hours. You may file a claim even if you already told us. We do not retaliate for filing a claim. Time-loss benefits are set by the insurer and by Oregon law, not by this handbook.",
  },
  {
    sectionNumber: "8.3",
    sectionTitle: "Weather and air quality closures",
    page: 23,
    content:
      "The founder or the studio manager decides when the Bend studio closes for snow, ice, or wildfire smoke. A closure is posted in the studio channel by 7:00 a.m. Pacific. If the studio is closed, hourly employees are paid for the hours they were scheduled that day, up to 8 hours. If the studio is open and you cannot travel safely, use sick time or paid time off, or work from home when your manager agrees the work can be done remotely that day.",
  },
  {
    sectionNumber: "9.1",
    sectionTitle: "Confidential information",
    page: 24,
    content:
      "Designs, line plans, factory prices, customer lists, and unreleased product are confidential. Do not share them outside the company, including on social media or with friends in the industry. This duty lasts during employment and after it ends. It does not stop you from discussing your own wages, or your working conditions, with other employees. That discussion is allowed. It does not stop you from reporting unlawful conduct to a government agency.",
  },
  {
    sectionNumber: "9.2",
    sectionTitle: "Equipment",
    page: 24,
    content:
      "Laptops, phones we issue, sample product, and tools remain company property. You may use the laptop for reasonable personal tasks that do not violate section 9.3. Do not let anyone else use your company login. Report a lost laptop to the People team within 24 hours. When employment ends, return every item within 5 business days. We deduct the replacement cost of unreturned equipment from a final paycheck only when Oregon law and a signed authorization allow it. Otherwise we invoice.",
  },
  {
    sectionNumber: "9.3",
    sectionTitle: "Acceptable use of systems",
    page: 25,
    content:
      "Company email and chat are for work. Brief personal use is fine. Do not use company systems for harassment, for illegal file sharing, or for an outside business. We may access a company account when we need to for security, a legal hold, or to keep work moving if you are out. We do not routinely read personal messages. Do not expect privacy in company email.",
  },
  {
    sectionNumber: "9.4",
    sectionTitle: "Social media",
    page: 25,
    content:
      "You may say that you work at Cedar & Pine. Do not post unreleased product, a factory partner, or a customer's private order. Do not speak for the company unless the founder or the brand lead asked you to. A personal account should not use the company logo as its picture. Customer care replies only from the official accounts.",
  },
  {
    sectionNumber: "10.1",
    sectionTitle: "Resignation",
    page: 26,
    content:
      "We ask for two weeks' notice in writing to your manager and the People team. Notice is requested, not required, because employment is at will. The company may end employment earlier during a notice period and pay you through the last day you work, plus unused accrued paid time off under section 10.2. Tell us where to send tax forms.",
  },
  {
    sectionNumber: "10.2",
    sectionTitle: "Final pay",
    page: 26,
    content:
      "If you resign and give at least 48 hours' notice, final wages are due on your last day, which is the Oregon rule we follow. If you resign with less notice, final wages are due within 5 business days or on the next payday, whichever comes first. If the company ends your employment, final wages are due by the end of the next business day. Final wages include hours worked and unused accrued paid time off. Sick time is not paid out. Finance confirms the amount in writing.",
  },
  {
    sectionNumber: "10.3",
    sectionTitle: "Return of property",
    page: 27,
    content:
      "On or before your last day, return your laptop, keys, badge, samples, and company card. The People team disables email and chat at the end of the last day. You may copy personal contacts out before access ends. We keep the mailbox on a confidential archive for legal and customer continuity. A folder named Personal can be sent to your personal email if you ask within 10 days.",
  },
]
