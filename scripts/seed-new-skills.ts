import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { pgTable, serial, varchar, integer, text, json } from 'drizzle-orm/pg-core';

// Define schema inline (matching lib/db/schema.ts)
const skills = pgTable('skills', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
});

const skillQuestions = pgTable('skill_questions', {
    id: serial('id').primaryKey(),
    skillId: integer('skill_id').notNull(),
    question: text('question').notNull(),
    options: json('options').notNull(), // Array of 4 strings
    correctIndex: integer('correct_index').notNull(),
});

// Database connection string
const connectionString = 'postgresql://neondb_owner:npg_Maus8bK6kdvD@ep-cold-forest-a4yns4nq-pooler.us-east-1.aws.neon.tech/bpdc?sslmode=require&channel_binding=require';

// Create postgres client
const client = postgres(connectionString);
const db = drizzle(client);

// Skills to add
const newSkills = [
    'Data Science',
    'Power BI',
    'Cyber Security',
    'Data Analytics',
    'Business Analytics',
    'AI/ML',
    'Finance',
    'Business Consulting',
    'HR',
    'Marketing',
    'Operations',
    'HVAC',
    'Quality Control',
    'Production Control',
    'Matlab',
    'Supply Chain & Logistics'
];

// Questions for each skill (15-20 questions each)
const skillQuestionsData: { [key: string]: Array<{ question: string; options: string[]; correctIndex: number }> } = {
    'Data Science': [
        { question: 'What is the primary goal of data science?', options: ['To store data', 'To extract insights and knowledge from data', 'To delete data', 'To format data'], correctIndex: 1 },
        { question: 'What is a feature in machine learning?', options: ['An input variable used to make predictions', 'A type of algorithm', 'A database table', 'A visualization'], correctIndex: 0 },
        { question: 'What is overfitting?', options: ['When a model performs well on training data but poorly on new data', 'When a model is too simple', 'When data is missing', 'When features are correlated'], correctIndex: 0 },
        { question: 'What is cross-validation used for?', options: ['To split data', 'To evaluate model performance and prevent overfitting', 'To clean data', 'To visualize data'], correctIndex: 1 },
        { question: 'What is the difference between supervised and unsupervised learning?', options: ['No difference', 'Supervised uses labeled data, unsupervised uses unlabeled data', 'Unsupervised uses labeled data, supervised uses unlabeled data', 'Both use labeled data'], correctIndex: 1 },
        { question: 'What is a confusion matrix?', options: ['A type of chart', 'A table showing classification performance', 'A data structure', 'A visualization tool'], correctIndex: 1 },
        { question: 'What is feature engineering?', options: ['Creating new features from existing data', 'Deleting features', 'Visualizing features', 'Storing features'], correctIndex: 0 },
        { question: 'What is the purpose of normalization?', options: ['To scale features to a similar range', 'To remove features', 'To add features', 'To visualize features'], correctIndex: 0 },
        { question: 'What is a p-value?', options: ['A probability value', 'The probability of observing results as extreme if null hypothesis is true', 'A type of chart', 'A data structure'], correctIndex: 1 },
        { question: 'What is correlation vs causation?', options: ['They are the same', 'Correlation shows relationship, causation shows cause-effect', 'Causation shows relationship, correlation shows cause-effect', 'Neither shows relationship'], correctIndex: 1 },
        { question: 'What is the purpose of A/B testing?', options: ['To test code', 'To compare two versions statistically', 'To visualize data', 'To store data'], correctIndex: 1 },
        { question: 'What is a decision tree?', options: ['A type of database', 'A tree-like model for decisions and predictions', 'A visualization', 'A data structure'], correctIndex: 1 },
        { question: 'What is ensemble learning?', options: ['Using one model', 'Combining multiple models for better predictions', 'Deleting models', 'Visualizing models'], correctIndex: 1 },
        { question: 'What is the bias-variance tradeoff?', options: ['No tradeoff exists', 'Balance between model complexity and generalization', 'Only bias matters', 'Only variance matters'], correctIndex: 1 },
        { question: 'What is dimensionality reduction?', options: ['Adding dimensions', 'Reducing number of features while preserving information', 'Deleting data', 'Expanding data'], correctIndex: 1 },
        { question: 'What is a ROC curve?', options: ['A type of chart', 'Receiver Operating Characteristic curve showing classification performance', 'A data structure', 'A visualization tool'], correctIndex: 1 },
        { question: 'What is the purpose of regularization?', options: ['To increase model complexity', 'To prevent overfitting by penalizing complexity', 'To remove features', 'To add features'], correctIndex: 1 },
        { question: 'What is time series analysis?', options: ['Analyzing data over time', 'Analyzing static data', 'Deleting time data', 'Storing time data'], correctIndex: 0 },
        { question: 'What is clustering?', options: ['A supervised learning technique', 'An unsupervised learning technique to group similar data', 'A type of regression', 'A visualization method'], correctIndex: 1 },
        { question: 'What is the purpose of feature selection?', options: ['To add all features', 'To select most relevant features for modeling', 'To delete all features', 'To visualize features'], correctIndex: 1 }
    ],
    'Power BI': [
        { question: 'What is Power BI?', options: ['A database', 'A business analytics tool for data visualization', 'A programming language', 'A web framework'], correctIndex: 1 },
        { question: 'What is a Power BI dataset?', options: ['A collection of reports', 'A collection of data used to create reports', 'A visualization', 'A dashboard'], correctIndex: 1 },
        { question: 'What is DAX?', options: ['Data Analysis Expression language for Power BI', 'A database', 'A visualization', 'A chart type'], correctIndex: 0 },
        { question: 'What is a measure in Power BI?', options: ['A calculated value using DAX', 'A table', 'A column', 'A visualization'], correctIndex: 0 },
        { question: 'What is a calculated column?', options: ['A column from source data', 'A column created using DAX expressions', 'A visualization', 'A chart'], correctIndex: 1 },
        { question: 'What is the difference between a measure and a calculated column?', options: ['No difference', 'Measures calculate at query time, columns are pre-calculated', 'Columns calculate at query time, measures are pre-calculated', 'Both are the same'], correctIndex: 1 },
        { question: 'What is Power Query?', options: ['A visualization tool', 'A data transformation and preparation tool', 'A database', 'A chart type'], correctIndex: 1 },
        { question: 'What is a relationship in Power BI?', options: ['A connection between tables', 'A connection between tables for data modeling', 'A visualization', 'A measure'], correctIndex: 1 },
        { question: 'What is a slicer?', options: ['A filter control for interactive filtering', 'A chart type', 'A table', 'A measure'], correctIndex: 0 },
        { question: 'What is the purpose of Power BI Desktop?', options: ['To view reports', 'To create and publish reports', 'To store data', 'To visualize only'], correctIndex: 1 },
        { question: 'What is a Power BI dashboard?', options: ['A collection of visualizations on one page', 'A single chart', 'A table', 'A measure'], correctIndex: 0 },
        { question: 'What is row-level security?', options: ['Security at database level', 'Security that restricts data access based on user', 'A visualization', 'A chart type'], correctIndex: 1 },
        { question: 'What is the difference between import and DirectQuery?', options: ['No difference', 'Import loads data, DirectQuery queries on-demand', 'DirectQuery loads data, Import queries on-demand', 'Both load data'], correctIndex: 1 },
        { question: 'What is a calculated table?', options: ['A table from source', 'A table created using DAX', 'A visualization', 'A chart'], correctIndex: 1 },
        { question: 'What is the purpose of Power BI Service?', options: ['To create reports', 'To share and collaborate on reports', 'To store data only', 'To visualize only'], correctIndex: 1 },
        { question: 'What is a hierarchy in Power BI?', options: ['A single level', 'A multi-level structure for drilling down data', 'A chart type', 'A measure'], correctIndex: 1 },
        { question: 'What is the CALCULATE function used for?', options: ['To calculate measures', 'To modify filter context in DAX', 'To create tables', 'To visualize data'], correctIndex: 1 },
        { question: 'What is a KPI visual?', options: ['A key performance indicator visualization', 'A table', 'A chart', 'A measure'], correctIndex: 0 },
        { question: 'What is the purpose of bookmarks in Power BI?', options: ['To save reports', 'To save specific views and states of a report', 'To delete reports', 'To share reports'], correctIndex: 1 },
        { question: 'What is a drill-through page?', options: ['A main page', 'A detail page accessed from another visual', 'A dashboard', 'A chart type'], correctIndex: 1 }
    ],
    'Cyber Security': [
        { question: 'What is cybersecurity?', options: ['Protecting physical assets', 'Protecting digital systems and data from threats', 'Protecting buildings', 'Protecting vehicles'], correctIndex: 1 },
        { question: 'What is a firewall?', options: ['A physical barrier', 'A network security device that monitors traffic', 'A software only', 'A hardware only'], correctIndex: 1 },
        { question: 'What is encryption?', options: ['Hiding data', 'Converting data into unreadable format to protect it', 'Deleting data', 'Copying data'], correctIndex: 1 },
        { question: 'What is a vulnerability?', options: ['A strength', 'A weakness that can be exploited', 'A feature', 'A tool'], correctIndex: 1 },
        { question: 'What is a threat?', options: ['A potential danger', 'A potential danger to information systems', 'A tool', 'A feature'], correctIndex: 1 },
        { question: 'What is phishing?', options: ['A fishing technique', 'A social engineering attack via deceptive emails', 'A type of malware', 'A firewall'], correctIndex: 1 },
        { question: 'What is malware?', options: ['Good software', 'Malicious software designed to harm systems', 'A firewall', 'An antivirus'], correctIndex: 1 },
        { question: 'What is two-factor authentication (2FA)?', options: ['One password', 'Two methods of verification for security', 'Two passwords', 'One method'], correctIndex: 1 },
        { question: 'What is a DDoS attack?', options: ['Data attack', 'Distributed Denial of Service attack overwhelming a system', 'A virus', 'A firewall'], correctIndex: 1 },
        { question: 'What is penetration testing?', options: ['Attacking systems', 'Authorized testing to find vulnerabilities', 'Installing malware', 'Deleting data'], correctIndex: 1 },
        { question: 'What is a zero-day vulnerability?', options: ['A known vulnerability', 'An unknown vulnerability with no patch available', 'A patched vulnerability', 'A fixed vulnerability'], correctIndex: 1 },
        { question: 'What is the principle of least privilege?', options: ['Giving maximum access', 'Giving minimum necessary access', 'No access control', 'Full access'], correctIndex: 1 },
        { question: 'What is SQL injection?', options: ['A database feature', 'An attack injecting malicious SQL code', 'A security tool', 'A firewall'], correctIndex: 1 },
        { question: 'What is a VPN?', options: ['A network', 'Virtual Private Network for secure connections', 'A firewall', 'An antivirus'], correctIndex: 1 },
        { question: 'What is endpoint security?', options: ['Server security', 'Protecting devices that connect to networks', 'Network security only', 'Cloud security only'], correctIndex: 1 },
        { question: 'What is incident response?', options: ['Preventing incidents', 'Process for handling security incidents', 'Ignoring incidents', 'Deleting incidents'], correctIndex: 1 },
        { question: 'What is a security audit?', options: ['A review', 'A systematic evaluation of security measures', 'An attack', 'A tool'], correctIndex: 1 },
        { question: 'What is the CIA triad?', options: ['Central Intelligence Agency', 'Confidentiality, Integrity, Availability security model', 'A type of attack', 'A tool'], correctIndex: 1 },
        { question: 'What is a honeypot?', options: ['A security tool', 'A decoy system to detect attacks', 'A firewall', 'An antivirus'], correctIndex: 1 },
        { question: 'What is patch management?', options: ['Installing software', 'Managing software updates and security patches', 'Deleting software', 'Ignoring updates'], correctIndex: 1 }
    ],
    'Data Analytics': [
        { question: 'What is data analytics?', options: ['Storing data', 'Analyzing data to extract insights', 'Deleting data', 'Copying data'], correctIndex: 1 },
        { question: 'What is descriptive analytics?', options: ['Predicting future', 'Describing what happened in the past', 'Prescribing actions', 'Optimizing processes'], correctIndex: 1 },
        { question: 'What is predictive analytics?', options: ['Describing past', 'Predicting future outcomes', 'Prescribing actions', 'Storing data'], correctIndex: 1 },
        { question: 'What is prescriptive analytics?', options: ['Describing past', 'Predicting future', 'Recommending actions to achieve outcomes', 'Storing data'], correctIndex: 2 },
        { question: 'What is ETL?', options: ['Extract, Transform, Load process', 'A database', 'A visualization', 'A chart type'], correctIndex: 0 },
        { question: 'What is data cleaning?', options: ['Deleting data', 'Removing errors and inconsistencies from data', 'Adding errors', 'Ignoring data'], correctIndex: 1 },
        { question: 'What is a data warehouse?', options: ['A database', 'A centralized repository for analytical data', 'A visualization', 'A chart'], correctIndex: 1 },
        { question: 'What is OLAP?', options: ['Online Analytical Processing for complex queries', 'A database type', 'A visualization', 'A chart'], correctIndex: 0 },
        { question: 'What is a pivot table?', options: ['A regular table', 'A summary table reorganizing data', 'A chart', 'A database'], correctIndex: 1 },
        { question: 'What is data mining?', options: ['Extracting minerals', 'Discovering patterns in large datasets', 'Deleting data', 'Storing data'], correctIndex: 1 },
        { question: 'What is a KPI?', options: ['A chart', 'Key Performance Indicator for measuring success', 'A table', 'A database'], correctIndex: 1 },
        { question: 'What is statistical analysis?', options: ['Simple counting', 'Using statistical methods to analyze data', 'Guessing', 'Visualizing only'], correctIndex: 1 },
        { question: 'What is correlation analysis?', options: ['Finding causation', 'Measuring relationship between variables', 'Deleting variables', 'Adding variables'], correctIndex: 1 },
        { question: 'What is regression analysis?', options: ['A type of chart', 'Modeling relationships between variables', 'Deleting data', 'Storing data'], correctIndex: 1 },
        { question: 'What is data visualization?', options: ['Hiding data', 'Presenting data in graphical form', 'Deleting data', 'Storing data'], correctIndex: 1 },
        { question: 'What is a dashboard?', options: ['A single chart', 'A collection of visualizations for monitoring', 'A table', 'A database'], correctIndex: 1 },
        { question: 'What is real-time analytics?', options: ['Historical analysis', 'Analyzing data as it is generated', 'Batch analysis', 'Delayed analysis'], correctIndex: 1 },
        { question: 'What is data profiling?', options: ['Deleting data', 'Examining data quality and structure', 'Visualizing data', 'Storing data'], correctIndex: 1 },
        { question: 'What is cohort analysis?', options: ['Individual analysis', 'Analyzing groups with shared characteristics', 'Random analysis', 'No analysis'], correctIndex: 1 },
        { question: 'What is A/B testing in analytics?', options: ['Testing code', 'Comparing two versions statistically', 'Visualizing data', 'Storing data'], correctIndex: 1 }
    ],
    'Business Analytics': [
        { question: 'What is business analytics?', options: ['Technical analytics', 'Using data to make business decisions', 'Personal analytics', 'Scientific analytics'], correctIndex: 1 },
        { question: 'What is a business intelligence system?', options: ['A database', 'A system for analyzing business data', 'A visualization tool', 'A chart type'], correctIndex: 1 },
        { question: 'What is customer analytics?', options: ['Product analytics', 'Analyzing customer behavior and preferences', 'Financial analytics', 'Operational analytics'], correctIndex: 1 },
        { question: 'What is financial analytics?', options: ['Customer analytics', 'Analyzing financial performance and trends', 'Product analytics', 'Marketing analytics'], correctIndex: 1 },
        { question: 'What is market segmentation?', options: ['Combining markets', 'Dividing market into distinct groups', 'Ignoring markets', 'Deleting markets'], correctIndex: 1 },
        { question: 'What is a sales forecast?', options: ['Historical sales', 'Predicting future sales', 'Current sales', 'Past sales only'], correctIndex: 1 },
        { question: 'What is customer lifetime value (CLV)?', options: ['Current value', 'Total value a customer brings over relationship', 'Initial value', 'One-time value'], correctIndex: 1 },
        { question: 'What is churn analysis?', options: ['Customer acquisition', 'Analyzing customer loss', 'Customer retention', 'Customer satisfaction'], correctIndex: 1 },
        { question: 'What is revenue analytics?', options: ['Cost analytics', 'Analyzing revenue streams and patterns', 'Expense analytics', 'Profit analytics only'], correctIndex: 1 },
        { question: 'What is operational analytics?', options: ['Financial analytics', 'Analyzing business operations efficiency', 'Marketing analytics', 'Customer analytics'], correctIndex: 1 },
        { question: 'What is a business metric?', options: ['A chart', 'A measurable indicator of business performance', 'A table', 'A database'], correctIndex: 1 },
        { question: 'What is competitive analysis?', options: ['Internal analysis', 'Analyzing competitors and market position', 'Customer analysis', 'Product analysis'], correctIndex: 1 },
        { question: 'What is pricing analytics?', options: ['Cost analysis', 'Analyzing pricing strategies and optimization', 'Revenue analysis', 'Profit analysis'], correctIndex: 1 },
        { question: 'What is supply chain analytics?', options: ['Marketing analytics', 'Analyzing supply chain efficiency', 'Financial analytics', 'Customer analytics'], correctIndex: 1 },
        { question: 'What is risk analytics?', options: ['Reward analysis', 'Analyzing business risks', 'Profit analysis', 'Revenue analysis'], correctIndex: 1 },
        { question: 'What is performance management?', options: ['Ignoring performance', 'Monitoring and improving business performance', 'Deleting metrics', 'Storing metrics'], correctIndex: 1 },
        { question: 'What is a balanced scorecard?', options: ['A single metric', 'A framework measuring multiple perspectives', 'A chart type', 'A database'], correctIndex: 1 },
        { question: 'What is predictive modeling in business?', options: ['Historical analysis', 'Using models to predict business outcomes', 'Current analysis', 'No modeling'], correctIndex: 1 },
        { question: 'What is data-driven decision making?', options: ['Guessing', 'Making decisions based on data analysis', 'Ignoring data', 'Using only intuition'], correctIndex: 1 },
        { question: 'What is business process optimization?', options: ['Maintaining processes', 'Improving business processes using analytics', 'Deleting processes', 'Ignoring processes'], correctIndex: 1 }
    ],
    'AI/ML': [
        { question: 'What is machine learning?', options: ['Manual programming', 'Systems learning from data without explicit programming', 'Fixed algorithms', 'Static systems'], correctIndex: 1 },
        { question: 'What is artificial intelligence?', options: ['Natural intelligence', 'Machines simulating human intelligence', 'Only robotics', 'Only automation'], correctIndex: 1 },
        { question: 'What is deep learning?', options: ['Shallow learning', 'ML using neural networks with multiple layers', 'Simple algorithms', 'Basic statistics'], correctIndex: 1 },
        { question: 'What is a neural network?', options: ['A database', 'Interconnected nodes mimicking brain neurons', 'A chart', 'A table'], correctIndex: 1 },
        { question: 'What is supervised learning?', options: ['Unlabeled data', 'Learning from labeled training data', 'No training', 'Random learning'], correctIndex: 1 },
        { question: 'What is unsupervised learning?', options: ['Labeled data', 'Finding patterns in unlabeled data', 'Supervised data', 'No data'], correctIndex: 1 },
        { question: 'What is reinforcement learning?', options: ['Supervised learning', 'Learning through rewards and penalties', 'Unsupervised learning', 'No learning'], correctIndex: 1 },
        { question: 'What is natural language processing (NLP)?', options: ['Image processing', 'Processing and understanding human language', 'Data processing', 'Signal processing'], correctIndex: 1 },
        { question: 'What is computer vision?', options: ['Text processing', 'Enabling machines to interpret visual information', 'Audio processing', 'Data processing'], correctIndex: 1 },
        { question: 'What is transfer learning?', options: ['Starting from scratch', 'Applying knowledge from one task to another', 'No learning', 'Forgetting knowledge'], correctIndex: 1 },
        { question: 'What is a gradient descent?', options: ['An optimization algorithm', 'An optimization algorithm to minimize error', 'A data structure', 'A visualization'], correctIndex: 1 },
        { question: 'What is overfitting in ML?', options: ['Underfitting', 'Model too complex, performs poorly on new data', 'Model too simple', 'Perfect model'], correctIndex: 1 },
        { question: 'What is cross-validation?', options: ['Single split', 'Evaluating model on multiple data splits', 'No validation', 'Training only'], correctIndex: 1 },
        { question: 'What is feature engineering?', options: ['Deleting features', 'Creating and selecting relevant features', 'Ignoring features', 'Using all features'], correctIndex: 1 },
        { question: 'What is a confusion matrix?', options: ['A chart', 'A table showing classification performance', 'A data structure', 'A model'], correctIndex: 1 },
        { question: 'What is precision in ML?', options: ['Recall', 'Proportion of positive predictions that are correct', 'Accuracy', 'F1 score'], correctIndex: 1 },
        { question: 'What is recall in ML?', options: ['Precision', 'Proportion of actual positives correctly identified', 'Accuracy', 'F1 score'], correctIndex: 1 },
        { question: 'What is an ensemble method?', options: ['Single model', 'Combining multiple models for better performance', 'No models', 'One model only'], correctIndex: 1 },
        { question: 'What is a decision tree?', options: ['A database', 'A tree-like model for decisions', 'A chart', 'A table'], correctIndex: 1 },
        { question: 'What is a random forest?', options: ['One tree', 'Ensemble of decision trees', 'A database', 'A chart'], correctIndex: 1 }
    ],
    'Finance': [
        { question: 'What is financial analysis?', options: ['Guessing', 'Evaluating financial performance and position', 'Ignoring data', 'Visualizing only'], correctIndex: 1 },
        { question: 'What is a balance sheet?', options: ['Income statement', 'Statement showing assets, liabilities, and equity', 'Cash flow statement', 'Budget'], correctIndex: 1 },
        { question: 'What is an income statement?', options: ['Balance sheet', 'Statement showing revenues and expenses', 'Cash flow', 'Budget'], correctIndex: 1 },
        { question: 'What is cash flow analysis?', options: ['Profit analysis', 'Analyzing cash inflows and outflows', 'Revenue analysis', 'Expense analysis'], correctIndex: 1 },
        { question: 'What is ROI?', options: ['Return on Investment - measure of profitability', 'A type of loan', 'A tax', 'An expense'], correctIndex: 0 },
        { question: 'What is NPV?', options: ['Net Present Value - value of future cash flows', 'A type of asset', 'A liability', 'An expense'], correctIndex: 0 },
        { question: 'What is working capital?', options: ['Fixed assets', 'Current assets minus current liabilities', 'Long-term debt', 'Equity'], correctIndex: 1 },
        { question: 'What is financial modeling?', options: ['Visualizing', 'Creating mathematical models of financial situations', 'Guessing', 'Ignoring data'], correctIndex: 1 },
        { question: 'What is ratio analysis?', options: ['Simple counting', 'Using ratios to evaluate financial performance', 'Visualizing only', 'Storing data'], correctIndex: 1 },
        { question: 'What is a budget?', options: ['Actual results', 'Financial plan for a period', 'Historical data', 'Forecast only'], correctIndex: 1 },
        { question: 'What is variance analysis?', options: ['Ignoring differences', 'Comparing actual vs planned performance', 'No comparison', 'Guessing'], correctIndex: 1 },
        { question: 'What is cost accounting?', options: ['Revenue accounting', 'Tracking and analyzing costs', 'Profit accounting', 'Asset accounting'], correctIndex: 1 },
        { question: 'What is financial forecasting?', options: ['Historical analysis', 'Predicting future financial performance', 'Current analysis', 'No prediction'], correctIndex: 1 },
        { question: 'What is risk management in finance?', options: ['Ignoring risks', 'Identifying and mitigating financial risks', 'Taking all risks', 'No management'], correctIndex: 1 },
        { question: 'What is portfolio management?', options: ['Single asset', 'Managing collection of investments', 'No management', 'Ignoring investments'], correctIndex: 1 },
        { question: 'What is capital budgeting?', options: ['Operating budget', 'Planning long-term investments', 'Short-term planning', 'No planning'], correctIndex: 1 },
        { question: 'What is break-even analysis?', options: ['Profit analysis', 'Finding point where revenue equals costs', 'Loss analysis', 'Revenue analysis'], correctIndex: 1 },
        { question: 'What is leverage?', options: ['No debt', 'Using borrowed funds to increase returns', 'Only equity', 'No financing'], correctIndex: 1 },
        { question: 'What is liquidity?', options: ['Illiquidity', 'Ability to convert assets to cash quickly', 'Fixed assets', 'Long-term assets'], correctIndex: 1 },
        { question: 'What is financial planning?', options: ['No planning', 'Creating roadmap for financial goals', 'Guessing', 'Ignoring goals'], correctIndex: 1 }
    ],
    'Business Consulting': [
        { question: 'What is business consulting?', options: ['Selling products', 'Providing expert advice to improve business', 'Managing operations', 'Only analyzing'], correctIndex: 1 },
        { question: 'What is a consulting engagement?', options: ['A meeting', 'A project where consultant works with client', 'A report', 'A presentation'], correctIndex: 1 },
        { question: 'What is strategic planning?', options: ['Tactical planning', 'Long-term planning for business direction', 'Operational planning', 'No planning'], correctIndex: 1 },
        { question: 'What is change management?', options: ['Maintaining status quo', 'Managing organizational change', 'Ignoring change', 'Resisting change'], correctIndex: 1 },
        { question: 'What is process improvement?', options: ['Maintaining processes', 'Enhancing business processes', 'Deleting processes', 'Ignoring processes'], correctIndex: 1 },
        { question: 'What is organizational design?', options: ['Ignoring structure', 'Designing organizational structure', 'No design', 'Random structure'], correctIndex: 1 },
        { question: 'What is stakeholder management?', options: ['Ignoring stakeholders', 'Managing relationships with stakeholders', 'No management', 'Avoiding stakeholders'], correctIndex: 1 },
        { question: 'What is a business case?', options: ['A legal case', 'Justification for a business initiative', 'A report', 'A presentation'], correctIndex: 1 },
        { question: 'What is gap analysis?', options: ['No analysis', 'Identifying gaps between current and desired state', 'Ignoring gaps', 'Filling gaps without analysis'], correctIndex: 1 },
        { question: 'What is benchmarking?', options: ['Ignoring standards', 'Comparing performance against best practices', 'No comparison', 'Setting low standards'], correctIndex: 1 },
        { question: 'What is SWOT analysis?', options: ['A chart', 'Analyzing Strengths, Weaknesses, Opportunities, Threats', 'A table', 'A database'], correctIndex: 1 },
        { question: 'What is a feasibility study?', options: ['Assuming feasibility', 'Evaluating if project is viable', 'Ignoring feasibility', 'No study'], correctIndex: 1 },
        { question: 'What is project management in consulting?', options: ['No management', 'Managing consulting projects', 'Ignoring projects', 'Random management'], correctIndex: 1 },
        { question: 'What is client relationship management?', options: ['Ignoring clients', 'Building and maintaining client relationships', 'No relationships', 'Avoiding clients'], correctIndex: 1 },
        { question: 'What is value proposition?', options: ['No value', 'Unique value offered to customers', 'Low value', 'Generic value'], correctIndex: 1 },
        { question: 'What is market analysis?', options: ['Ignoring market', 'Analyzing market conditions and opportunities', 'No analysis', 'Guessing market'], correctIndex: 1 },
        { question: 'What is competitive strategy?', options: ['No strategy', 'Strategy to gain competitive advantage', 'Copying competitors', 'Ignoring competition'], correctIndex: 1 },
        { question: 'What is business transformation?', options: ['Maintaining status quo', 'Fundamental change in business', 'Minor changes', 'No change'], correctIndex: 1 },
        { question: 'What is ROI in consulting?', options: ['No return', 'Measuring return on consulting investment', 'Ignoring return', 'Assuming return'], correctIndex: 1 },
        { question: 'What is best practices?', options: ['Worst practices', 'Proven methods for optimal results', 'Random practices', 'No practices'], correctIndex: 1 }
    ],
    'HR': [
        { question: 'What is human resources?', options: ['Managing machines', 'Managing people and organizational culture', 'Managing products', 'Managing finances'], correctIndex: 1 },
        { question: 'What is talent acquisition?', options: ['Losing talent', 'Recruiting and hiring talent', 'Ignoring talent', 'Managing only'], correctIndex: 1 },
        { question: 'What is performance management?', options: ['Ignoring performance', 'Managing employee performance', 'No management', 'Random evaluation'], correctIndex: 1 },
        { question: 'What is employee engagement?', options: ['Disengagement', 'Employee commitment and involvement', 'Ignoring employees', 'No engagement'], correctIndex: 1 },
        { question: 'What is compensation and benefits?', options: ['No compensation', 'Employee pay and benefits package', 'Only salary', 'Only benefits'], correctIndex: 1 },
        { question: 'What is learning and development?', options: ['No learning', 'Employee training and skill development', 'Ignoring development', 'Random training'], correctIndex: 1 },
        { question: 'What is succession planning?', options: ['No planning', 'Planning for leadership transitions', 'Ignoring transitions', 'Random planning'], correctIndex: 1 },
        { question: 'What is diversity and inclusion?', options: ['Homogeneity', 'Embracing diverse workforce', 'Exclusion', 'No diversity'], correctIndex: 1 },
        { question: 'What is HR analytics?', options: ['Guessing', 'Using data to make HR decisions', 'Ignoring data', 'No analytics'], correctIndex: 1 },
        { question: 'What is employee retention?', options: ['Losing employees', 'Keeping valuable employees', 'Ignoring retention', 'No retention'], correctIndex: 1 },
        { question: 'What is organizational culture?', options: ['No culture', 'Shared values and behaviors', 'Individual values', 'Random values'], correctIndex: 1 },
        { question: 'What is talent management?', options: ['Ignoring talent', 'Developing and retaining talent', 'No management', 'Random management'], correctIndex: 1 },
        { question: 'What is workforce planning?', options: ['No planning', 'Planning workforce needs', 'Ignoring needs', 'Random planning'], correctIndex: 1 },
        { question: 'What is employee relations?', options: ['No relations', 'Managing employee relationships', 'Ignoring relations', 'Avoiding relations'], correctIndex: 1 },
        { question: 'What is HR compliance?', options: ['Ignoring laws', 'Following employment laws and regulations', 'Breaking laws', 'No compliance'], correctIndex: 1 },
        { question: 'What is onboarding?', options: ['Offboarding', 'Integrating new employees', 'Ignoring new employees', 'No integration'], correctIndex: 1 },
        { question: 'What is performance appraisal?', options: ['No evaluation', 'Evaluating employee performance', 'Ignoring performance', 'Random evaluation'], correctIndex: 1 },
        { question: 'What is change management in HR?', options: ['Resisting change', 'Managing organizational change', 'No change', 'Random change'], correctIndex: 1 },
        { question: 'What is employer branding?', options: ['No branding', 'Company reputation as employer', 'Ignoring reputation', 'Bad reputation'], correctIndex: 1 },
        { question: 'What is HR strategy?', options: ['No strategy', 'Strategic approach to people management', 'Random approach', 'Ignoring strategy'], correctIndex: 1 }
    ],
    'Marketing': [
        { question: 'What is marketing?', options: ['Selling only', 'Creating and delivering value to customers', 'Advertising only', 'Promotion only'], correctIndex: 1 },
        { question: 'What is the marketing mix (4Ps)?', options: ['Product, Price, Place, Promotion', 'A single element', 'Only product', 'Only price'], correctIndex: 0 },
        { question: 'What is market segmentation?', options: ['One market', 'Dividing market into segments', 'Ignoring segments', 'No segmentation'], correctIndex: 1 },
        { question: 'What is a target market?', options: ['All markets', 'Specific customer group to serve', 'No market', 'Random market'], correctIndex: 1 },
        { question: 'What is brand positioning?', options: ['No positioning', 'How brand is perceived in market', 'Ignoring perception', 'Random positioning'], correctIndex: 1 },
        { question: 'What is customer acquisition?', options: ['Losing customers', 'Gaining new customers', 'Ignoring customers', 'No acquisition'], correctIndex: 1 },
        { question: 'What is customer retention?', options: ['Losing customers', 'Keeping existing customers', 'Ignoring customers', 'No retention'], correctIndex: 1 },
        { question: 'What is digital marketing?', options: ['Traditional only', 'Marketing using digital channels', 'No marketing', 'Only social media'], correctIndex: 1 },
        { question: 'What is content marketing?', options: ['No content', 'Creating valuable content to attract customers', 'Only advertising', 'Only sales'], correctIndex: 1 },
        { question: 'What is SEO?', options: ['Search Engine Optimization - improving search visibility', 'A type of ad', 'A social media', 'A website'], correctIndex: 0 },
        { question: 'What is SEM?', options: ['Search Engine Marketing - paid search advertising', 'A type of content', 'A social media', 'A website'], correctIndex: 0 },
        { question: 'What is social media marketing?', options: ['No social media', 'Marketing through social platforms', 'Only Facebook', 'Only Twitter'], correctIndex: 1 },
        { question: 'What is email marketing?', options: ['No emails', 'Marketing through email campaigns', 'Spam only', 'No campaigns'], correctIndex: 1 },
        { question: 'What is influencer marketing?', options: ['No influencers', 'Marketing through influencers', 'Only celebrities', 'No marketing'], correctIndex: 1 },
        { question: 'What is marketing analytics?', options: ['Guessing', 'Measuring marketing performance', 'Ignoring data', 'No analytics'], correctIndex: 1 },
        { question: 'What is customer lifetime value?', options: ['One-time value', 'Total value over customer relationship', 'Initial value', 'No value'], correctIndex: 1 },
        { question: 'What is conversion rate?', options: ['No conversion', 'Percentage of visitors taking desired action', 'All visitors', 'No visitors'], correctIndex: 1 },
        { question: 'What is A/B testing in marketing?', options: ['No testing', 'Testing two versions to see which performs better', 'Only one version', 'No comparison'], correctIndex: 1 },
        { question: 'What is marketing automation?', options: ['Manual only', 'Automating marketing tasks', 'No automation', 'Random automation'], correctIndex: 1 },
        { question: 'What is brand equity?', options: ['No value', 'Value of brand in market', 'Low value', 'Negative value'], correctIndex: 1 }
    ],
    'Operations': [
        { question: 'What is operations management?', options: ['Managing sales', 'Managing production and delivery of goods/services', 'Managing finance', 'Managing HR'], correctIndex: 1 },
        { question: 'What is supply chain management?', options: ['Managing one link', 'Managing flow from supplier to customer', 'Managing only suppliers', 'Managing only customers'], correctIndex: 1 },
        { question: 'What is quality management?', options: ['Ignoring quality', 'Ensuring products meet quality standards', 'Low quality', 'No standards'], correctIndex: 1 },
        { question: 'What is process optimization?', options: ['Maintaining processes', 'Improving process efficiency', 'Deleting processes', 'Ignoring processes'], correctIndex: 1 },
        { question: 'What is inventory management?', options: ['No inventory', 'Managing stock levels', 'Ignoring stock', 'Random stock'], correctIndex: 1 },
        { question: 'What is lean manufacturing?', options: ['Wasteful processes', 'Eliminating waste in processes', 'Adding waste', 'Ignoring waste'], correctIndex: 1 },
        { question: 'What is Six Sigma?', options: ['A number', 'Quality improvement methodology', 'A process', 'A tool'], correctIndex: 1 },
        { question: 'What is capacity planning?', options: ['No planning', 'Planning production capacity', 'Ignoring capacity', 'Random planning'], correctIndex: 1 },
        { question: 'What is production scheduling?', options: ['No scheduling', 'Planning production timeline', 'Random scheduling', 'Ignoring timeline'], correctIndex: 1 },
        { question: 'What is facility layout?', options: ['No layout', 'Arranging facilities for efficiency', 'Random layout', 'Ignoring efficiency'], correctIndex: 1 },
        { question: 'What is maintenance management?', options: ['No maintenance', 'Managing equipment maintenance', 'Ignoring maintenance', 'Random maintenance'], correctIndex: 1 },
        { question: 'What is productivity?', options: ['Output only', 'Output per unit of input', 'Input only', 'No measurement'], correctIndex: 1 },
        { question: 'What is throughput?', options: ['Input rate', 'Output rate of a process', 'No rate', 'Random rate'], correctIndex: 1 },
        { question: 'What is bottleneck analysis?', options: ['Ignoring bottlenecks', 'Identifying process constraints', 'No analysis', 'Random analysis'], correctIndex: 1 },
        { question: 'What is just-in-time (JIT)?', options: ['Stockpiling', 'Producing/delivering just when needed', 'Always late', 'Random timing'], correctIndex: 1 },
        { question: 'What is total quality management?', options: ['Partial quality', 'Organization-wide quality focus', 'No quality', 'Low quality'], correctIndex: 1 },
        { question: 'What is operations strategy?', options: ['No strategy', 'Strategic approach to operations', 'Random approach', 'Ignoring strategy'], correctIndex: 1 },
        { question: 'What is process mapping?', options: ['No mapping', 'Visualizing process flow', 'Ignoring flow', 'Random mapping'], correctIndex: 1 },
        { question: 'What is continuous improvement?', options: ['No improvement', 'Ongoing process improvement', 'One-time improvement', 'Random improvement'], correctIndex: 1 },
        { question: 'What is operations analytics?', options: ['Guessing', 'Using data for operations decisions', 'Ignoring data', 'No analytics'], correctIndex: 1 }
    ],
    'HVAC': [
        { question: 'What does HVAC stand for?', options: ['Heating, Ventilation, Air Conditioning', 'High Voltage Air Control', 'Heating Ventilation Auto Control', 'High Volume Air Conditioning'], correctIndex: 0 },
        { question: 'What is the purpose of a thermostat?', options: ['To cool air', 'To control temperature', 'To heat only', 'To ventilate only'], correctIndex: 1 },
        { question: 'What is SEER rating?', options: ['Seasonal Energy Efficiency Ratio for cooling efficiency', 'A temperature', 'A pressure', 'A volume'], correctIndex: 0 },
        { question: 'What is a heat pump?', options: ['Only heating', 'System that can heat and cool', 'Only cooling', 'Only ventilation'], correctIndex: 1 },
        { question: 'What is refrigerant?', options: ['A gas only', 'Fluid used for heat transfer in HVAC', 'A solid', 'Air only'], correctIndex: 1 },
        { question: 'What is ductwork?', options: ['Pipes for water', 'Channels for air distribution', 'Electrical wires', 'Cables'], correctIndex: 1 },
        { question: 'What is a compressor?', options: ['A fan', 'Component that pressurizes refrigerant', 'A filter', 'A thermostat'], correctIndex: 1 },
        { question: 'What is air balancing?', options: ['Ignoring air', 'Adjusting airflow for proper distribution', 'No adjustment', 'Random adjustment'], correctIndex: 1 },
        { question: 'What is a zone system?', options: ['Single zone', 'Multiple temperature zones', 'No zones', 'Random zones'], correctIndex: 1 },
        { question: 'What is load calculation?', options: ['Guessing', 'Calculating heating/cooling requirements', 'Ignoring calculation', 'Random calculation'], correctIndex: 1 },
        { question: 'What is a filter?', options: ['No filtering', 'Removes particles from air', 'Adds particles', 'No function'], correctIndex: 1 },
        { question: 'What is ventilation?', options: ['No air exchange', 'Exchanging indoor and outdoor air', 'Only heating', 'Only cooling'], correctIndex: 1 },
        { question: 'What is a condenser?', options: ['A heater', 'Component that releases heat', 'A filter', 'A thermostat'], correctIndex: 1 },
        { question: 'What is an evaporator?', options: ['A heater', 'Component that absorbs heat', 'A filter', 'A thermostat'], correctIndex: 1 },
        { question: 'What is a damper?', options: ['A valve', 'Device controlling airflow', 'A filter', 'A thermostat'], correctIndex: 1 },
        { question: 'What is HVAC maintenance?', options: ['No maintenance', 'Regular servicing of systems', 'Ignoring systems', 'Random maintenance'], correctIndex: 1 },
        { question: 'What is energy efficiency in HVAC?', options: ['Wasting energy', 'Minimizing energy consumption', 'Maximum energy use', 'No efficiency'], correctIndex: 1 },
        { question: 'What is IAQ?', options: ['Indoor Air Quality', 'A temperature', 'A pressure', 'A volume'], correctIndex: 0 },
        { question: 'What is a VAV system?', options: ['Variable Air Volume system', 'A single speed', 'A fixed volume', 'No variation'], correctIndex: 0 },
        { question: 'What is HVAC design?', options: ['No design', 'Planning HVAC systems for buildings', 'Random design', 'Ignoring design'], correctIndex: 1 }
    ],
    'Quality Control': [
        { question: 'What is quality control?', options: ['Ignoring quality', 'Ensuring products meet quality standards', 'Low quality', 'No standards'], correctIndex: 1 },
        { question: 'What is inspection?', options: ['Ignoring products', 'Examining products for defects', 'No examination', 'Random examination'], correctIndex: 1 },
        { question: 'What is statistical process control?', options: ['Guessing', 'Using statistics to monitor processes', 'No statistics', 'Random monitoring'], correctIndex: 1 },
        { question: 'What is a control chart?', options: ['A regular chart', 'Chart monitoring process variation', 'A table', 'A database'], correctIndex: 1 },
        { question: 'What is sampling?', options: ['Testing all items', 'Testing subset of items', 'No testing', 'Random testing'], correctIndex: 1 },
        { question: 'What is acceptance sampling?', options: ['Rejecting all', 'Sampling to accept/reject batches', 'Accepting all', 'No decision'], correctIndex: 1 },
        { question: 'What is a defect?', options: ['A feature', 'Nonconformance to requirements', 'A standard', 'A quality'], correctIndex: 1 },
        { question: 'What is nonconformance?', options: ['Conformance', 'Failure to meet requirements', 'Meeting requirements', 'Exceeding requirements'], correctIndex: 1 },
        { question: 'What is corrective action?', options: ['Ignoring problems', 'Action to eliminate cause of nonconformance', 'No action', 'Random action'], correctIndex: 1 },
        { question: 'What is preventive action?', options: ['Reactive action', 'Action to prevent potential problems', 'No prevention', 'Ignoring prevention'], correctIndex: 1 },
        { question: 'What is calibration?', options: ['No adjustment', 'Adjusting equipment to standards', 'Random adjustment', 'Ignoring standards'], correctIndex: 1 },
        { question: 'What is traceability?', options: ['No tracking', 'Ability to trace product history', 'Random tracking', 'Ignoring history'], correctIndex: 1 },
        { question: 'What is a quality audit?', options: ['No review', 'Systematic review of quality system', 'Random review', 'Ignoring system'], correctIndex: 1 },
        { question: 'What is first article inspection?', options: ['No inspection', 'Detailed inspection of first production item', 'Random inspection', 'Ignoring first item'], correctIndex: 1 },
        { question: 'What is dimensional inspection?', options: ['Visual only', 'Measuring physical dimensions', 'No measurement', 'Random measurement'], correctIndex: 1 },
        { question: 'What is quality assurance?', options: ['No assurance', 'Systematic approach to ensure quality', 'Random approach', 'Ignoring quality'], correctIndex: 1 },
        { question: 'What is a quality plan?', options: ['No plan', 'Plan for quality activities', 'Random plan', 'Ignoring activities'], correctIndex: 1 },
        { question: 'What is supplier quality?', options: ['Ignoring suppliers', 'Ensuring supplier quality', 'No quality', 'Low quality'], correctIndex: 1 },
        { question: 'What is process capability?', options: ['No capability', 'Ability of process to meet specifications', 'Random capability', 'Ignoring specifications'], correctIndex: 1 },
        { question: 'What is quality metrics?', options: ['No metrics', 'Measures of quality performance', 'Random metrics', 'Ignoring performance'], correctIndex: 1 }
    ],
    'Production Control': [
        { question: 'What is production control?', options: ['No control', 'Managing production processes', 'Ignoring production', 'Random control'], correctIndex: 1 },
        { question: 'What is production planning?', options: ['No planning', 'Planning production activities', 'Random planning', 'Ignoring activities'], correctIndex: 1 },
        { question: 'What is a production schedule?', options: ['No schedule', 'Timeline for production', 'Random timeline', 'Ignoring timeline'], correctIndex: 1 },
        { question: 'What is capacity planning?', options: ['No planning', 'Planning production capacity', 'Ignoring capacity', 'Random planning'], correctIndex: 1 },
        { question: 'What is material requirements planning (MRP)?', options: ['No planning', 'Planning material needs for production', 'Random planning', 'Ignoring materials'], correctIndex: 1 },
        { question: 'What is production routing?', options: ['No routing', 'Sequence of operations for production', 'Random sequence', 'Ignoring operations'], correctIndex: 1 },
        { question: 'What is work-in-progress (WIP)?', options: ['Finished goods', 'Goods in production process', 'Raw materials', 'No goods'], correctIndex: 1 },
        { question: 'What is throughput?', options: ['Input rate', 'Output rate of production', 'No rate', 'Random rate'], correctIndex: 1 },
        { question: 'What is bottleneck management?', options: ['Ignoring bottlenecks', 'Managing production constraints', 'No management', 'Random management'], correctIndex: 1 },
        { question: 'What is production efficiency?', options: ['Inefficiency', 'Output per unit of input', 'Low output', 'No measurement'], correctIndex: 1 },
        { question: 'What is line balancing?', options: ['Imbalance', 'Balancing work across production line', 'No balance', 'Random balance'], correctIndex: 1 },
        { question: 'What is changeover time?', options: ['No change', 'Time to switch between products', 'Same time always', 'Random time'], correctIndex: 1 },
        { question: 'What is production tracking?', options: ['No tracking', 'Monitoring production progress', 'Random tracking', 'Ignoring progress'], correctIndex: 1 },
        { question: 'What is just-in-time production?', options: ['Stockpiling', 'Producing just when needed', 'Always early', 'Random timing'], correctIndex: 1 },
        { question: 'What is kanban?', options: ['A board', 'Visual system for production control', 'A schedule', 'A database'], correctIndex: 1 },
        { question: 'What is production reporting?', options: ['No reporting', 'Reporting production metrics', 'Random reporting', 'Ignoring metrics'], correctIndex: 1 },
        { question: 'What is production optimization?', options: ['No optimization', 'Improving production processes', 'Maintaining status quo', 'Random optimization'], correctIndex: 1 },
        { question: 'What is quality control in production?', options: ['Ignoring quality', 'Ensuring production quality', 'Low quality', 'No quality'], correctIndex: 1 },
        { question: 'What is production analytics?', options: ['Guessing', 'Using data for production decisions', 'Ignoring data', 'No analytics'], correctIndex: 1 },
        { question: 'What is production performance?', options: ['No performance', 'Measuring production effectiveness', 'Random measurement', 'Ignoring effectiveness'], correctIndex: 1 }
    ],
    'Matlab': [
        { question: 'What is MATLAB?', options: ['A database', 'Matrix Laboratory - programming environment', 'A web framework', 'A database'], correctIndex: 1 },
        { question: 'What is a matrix in MATLAB?', options: ['A single number', 'Array of numbers arranged in rows and columns', 'A string', 'A function'], correctIndex: 1 },
        { question: 'What is the purpose of semicolon (;) in MATLAB?', options: ['To end statements', 'To suppress output', 'To create arrays', 'To define functions'], correctIndex: 1 },
        { question: 'What is a script in MATLAB?', options: ['A function', 'File containing MATLAB commands', 'A variable', 'A matrix'], correctIndex: 1 },
        { question: 'What is a function in MATLAB?', options: ['A script', 'Reusable code block with inputs/outputs', 'A variable', 'A matrix'], correctIndex: 1 },
        { question: 'What is array indexing in MATLAB?', options: ['Starting at 0', 'Starting at 1', 'Starting at -1', 'No indexing'], correctIndex: 1 },
        { question: 'What is the purpose of plot() function?', options: ['To calculate', 'To create 2D plots', 'To store data', 'To delete data'], correctIndex: 1 },
        { question: 'What is a cell array?', options: ['A regular array', 'Array that can hold different data types', 'A matrix', 'A function'], correctIndex: 1 },
        { question: 'What is the purpose of fprintf()?', options: ['To read files', 'To format and print output', 'To plot', 'To calculate'], correctIndex: 1 },
        { question: 'What is a structure in MATLAB?', options: ['A function', 'Data type with named fields', 'A matrix', 'An array'], correctIndex: 1 },
        { question: 'What is vectorization?', options: ['Using loops', 'Operations on entire arrays without loops', 'Using functions', 'Using scripts'], correctIndex: 1 },
        { question: 'What is the purpose of linspace()?', options: ['To create linear array', 'To create linearly spaced vector', 'To plot', 'To calculate'], correctIndex: 1 },
        { question: 'What is Simulink?', options: ['A function', 'Block diagram environment for simulation', 'A matrix', 'An array'], correctIndex: 1 },
        { question: 'What is the purpose of meshgrid()?', options: ['To plot', 'To create coordinate matrices', 'To calculate', 'To store data'], correctIndex: 1 },
        { question: 'What is a handle in MATLAB?', options: ['A variable', 'Reference to graphics object', 'A function', 'A matrix'], correctIndex: 1 },
        { question: 'What is the purpose of ode45()?', options: ['To plot', 'To solve ordinary differential equations', 'To calculate', 'To store data'], correctIndex: 1 },
        { question: 'What is a MEX file?', options: ['A MATLAB file', 'Compiled C/C++ function for MATLAB', 'A script', 'A function'], correctIndex: 1 },
        { question: 'What is the purpose of find()?', options: ['To search files', 'To find indices of non-zero elements', 'To plot', 'To calculate'], correctIndex: 1 },
        { question: 'What is a toolbox in MATLAB?', options: ['A function', 'Collection of functions for specific domain', 'A script', 'A matrix'], correctIndex: 1 },
        { question: 'What is the purpose of save() and load()?', options: ['To plot', 'To save and load workspace variables', 'To calculate', 'To delete'], correctIndex: 1 }
    ],
    'Supply Chain & Logistics': [
        { question: 'What is supply chain management?', options: ['Managing one link', 'Managing flow from supplier to customer', 'Managing only suppliers', 'Managing only customers'], correctIndex: 1 },
        { question: 'What is logistics?', options: ['Planning only', 'Planning and executing movement of goods', 'Only transportation', 'Only storage'], correctIndex: 1 },
        { question: 'What is inventory management?', options: ['No inventory', 'Managing stock levels', 'Ignoring stock', 'Random stock'], correctIndex: 1 },
        { question: 'What is warehousing?', options: ['No storage', 'Storing goods', 'Only transportation', 'Only planning'], correctIndex: 1 },
        { question: 'What is transportation management?', options: ['No transportation', 'Managing movement of goods', 'Only storage', 'Only planning'], correctIndex: 1 },
        { question: 'What is demand forecasting?', options: ['Guessing', 'Predicting future demand', 'Ignoring demand', 'No prediction'], correctIndex: 1 },
        { question: 'What is procurement?', options: ['Selling', 'Acquiring goods and services', 'Storing', 'Transporting'], correctIndex: 1 },
        { question: 'What is a distribution center?', options: ['A factory', 'Facility for storing and distributing goods', 'A supplier', 'A customer'], correctIndex: 1 },
        { question: 'What is lead time?', options: ['No time', 'Time from order to delivery', 'Production time only', 'Transportation time only'], correctIndex: 1 },
        { question: 'What is order fulfillment?', options: ['No fulfillment', 'Process of completing customer orders', 'Only ordering', 'Only shipping'], correctIndex: 1 },
        { question: 'What is reverse logistics?', options: ['Forward only', 'Managing returns and reverse flow', 'No returns', 'Ignoring returns'], correctIndex: 1 },
        { question: 'What is supply chain visibility?', options: ['No visibility', 'Tracking goods through supply chain', 'Random tracking', 'Ignoring tracking'], correctIndex: 1 },
        { question: 'What is a third-party logistics (3PL)?', options: ['Internal logistics', 'External provider of logistics services', 'No logistics', 'Random logistics'], correctIndex: 1 },
        { question: 'What is cross-docking?', options: ['Long storage', 'Minimal storage, direct transfer', 'No transfer', 'Random transfer'], correctIndex: 1 },
        { question: 'What is supply chain optimization?', options: ['No optimization', 'Improving supply chain efficiency', 'Maintaining status quo', 'Random optimization'], correctIndex: 1 },
        { question: 'What is a bill of materials (BOM)?', options: ['A list', 'List of components for a product', 'A schedule', 'A database'], correctIndex: 1 },
        { question: 'What is supply chain risk management?', options: ['Ignoring risks', 'Managing supply chain risks', 'No management', 'Random management'], correctIndex: 1 },
        { question: 'What is vendor management?', options: ['Ignoring vendors', 'Managing supplier relationships', 'No management', 'Random management'], correctIndex: 1 },
        { question: 'What is supply chain analytics?', options: ['Guessing', 'Using data for supply chain decisions', 'Ignoring data', 'No analytics'], correctIndex: 1 },
        { question: 'What is lean supply chain?', options: ['Wasteful', 'Eliminating waste in supply chain', 'Adding waste', 'Ignoring waste'], correctIndex: 1 }
    ],
    // Existing skills that need more questions
    'JavaScript': [
        { question: 'What is the output of: console.log(typeof null)?', options: ['null', 'object', 'undefined', 'boolean'], correctIndex: 1 },
        { question: 'Which method is used to add an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correctIndex: 0 },
        { question: 'What does the "this" keyword refer to in a regular function?', options: ['The function itself', 'The global object', 'The object that called the function', 'undefined'], correctIndex: 2 },
        { question: 'What is a closure in JavaScript?', options: ['A function that has no parameters', 'A function that has access to variables in its outer scope', 'A function that returns undefined', 'A function that is called immediately'], correctIndex: 1 },
        { question: 'What is the difference between == and ===?', options: ['No difference', '== checks value, === checks value and type', '=== checks value, == checks value and type', 'Both check only type'], correctIndex: 1 },
        { question: 'What is the purpose of the async/await keywords?', options: ['To make code synchronous', 'To handle asynchronous operations', 'To create loops', 'To define variables'], correctIndex: 1 },
        { question: 'What is a Promise in JavaScript?', options: ['A function that returns immediately', 'An object representing eventual completion of an async operation', 'A type of loop', 'A way to declare variables'], correctIndex: 1 },
        { question: 'What does the spread operator (...) do?', options: ['Removes elements from an array', 'Expands an iterable into individual elements', 'Combines two arrays', 'Sorts an array'], correctIndex: 1 },
        { question: 'What is hoisting in JavaScript?', options: ['Moving code to the bottom', 'Moving variable and function declarations to the top', 'Removing variables', 'A type of loop'], correctIndex: 1 },
        { question: 'What is the purpose of use strict?', options: ['To make code run faster', 'To enable strict mode which catches common errors', 'To disable errors', 'To allow more flexibility'], correctIndex: 1 },
        { question: 'What is a callback function?', options: ['A function that is called immediately', 'A function passed as an argument to another function', 'A function that returns a value', 'A function that modifies variables'], correctIndex: 1 },
        { question: 'What is destructuring in JavaScript?', options: ['Breaking down code', 'Extracting values from arrays or objects into variables', 'Removing elements', 'Combining arrays'], correctIndex: 1 },
        { question: 'What is the difference between let, const, and var?', options: ['No difference', 'let and const are block-scoped, var is function-scoped', 'var is block-scoped, let and const are function-scoped', 'All are function-scoped'], correctIndex: 1 },
        { question: 'What is an arrow function?', options: ['A function with arrows', 'A shorter syntax for writing functions', 'A function that only works with arrays', 'A type of loop'], correctIndex: 1 },
        { question: 'What is the event loop?', options: ['A type of loop', 'A mechanism that handles asynchronous operations', 'A database query', 'A routing mechanism'], correctIndex: 1 },
        { question: 'What is a module in JavaScript?', options: ['A file', 'A reusable piece of code that can be imported', 'A function', 'A variable'], correctIndex: 1 },
        { question: 'What is the purpose of map() method?', options: ['To create a map', 'To transform each element of an array', 'To filter elements', 'To sort elements'], correctIndex: 1 },
        { question: 'What is the purpose of filter() method?', options: ['To remove all elements', 'To create a new array with elements that pass a test', 'To sort elements', 'To combine arrays'], correctIndex: 1 },
        { question: 'What is the purpose of reduce() method?', options: ['To reduce array size', 'To reduce array to a single value', 'To remove elements', 'To sort elements'], correctIndex: 1 },
        { question: 'What is a prototype in JavaScript?', options: ['A type of function', 'A mechanism for inheritance', 'A variable', 'A loop'], correctIndex: 1 }
    ],
    'Python': [
        { question: 'What is the correct way to create a list in Python?', options: ['list = []', 'list = list()', 'list = [] or list()', 'All of the above'], correctIndex: 3 },
        { question: 'What is a dictionary in Python?', options: ['A list of keys', 'A collection of key-value pairs', 'A type of loop', 'A function'], correctIndex: 1 },
        { question: 'What does len() function do?', options: ['Returns the length of a string', 'Returns the length of a list', 'Returns the length of various data types', 'All of the above'], correctIndex: 3 },
        { question: 'What is a tuple in Python?', options: ['A mutable sequence', 'An immutable sequence', 'A dictionary', 'A set'], correctIndex: 1 },
        { question: 'What is list comprehension?', options: ['A way to create lists', 'A concise way to create lists', 'A type of loop', 'A function'], correctIndex: 1 },
        { question: 'What does the "self" parameter represent?', options: ['The class itself', 'The instance of the class', 'A method', 'A variable'], correctIndex: 1 },
        { question: 'What is the difference between append() and extend()?', options: ['No difference', 'append adds one element, extend adds multiple', 'extend adds one element, append adds multiple', 'Both add multiple elements'], correctIndex: 1 },
        { question: 'What is a decorator in Python?', options: ['A function that modifies another function', 'A type of variable', 'A loop construct', 'A data structure'], correctIndex: 0 },
        { question: 'What is the difference between / and // in Python?', options: ['No difference', '/ is float division, // is integer division', '// is float division, / is integer division', 'Both are integer division'], correctIndex: 1 },
        { question: 'What is a generator in Python?', options: ['A function that returns a value', 'A function that yields values one at a time', 'A type of loop', 'A data structure'], correctIndex: 1 },
        { question: 'What is a lambda function?', options: ['A named function', 'An anonymous function defined with lambda', 'A type of loop', 'A data structure'], correctIndex: 1 },
        { question: 'What is the purpose of __init__ method?', options: ['To initialize a class', 'To initialize an instance of a class', 'To delete an object', 'To print an object'], correctIndex: 1 },
        { question: 'What is the difference between == and is?', options: ['No difference', '== compares values, is compares identity', 'is compares values, == compares identity', 'Both compare identity'], correctIndex: 1 },
        { question: 'What is a module in Python?', options: ['A file', 'A file containing Python definitions and statements', 'A function', 'A variable'], correctIndex: 1 },
        { question: 'What is the purpose of try-except?', options: ['To try code', 'To handle exceptions and errors', 'To skip code', 'To loop code'], correctIndex: 1 },
        { question: 'What is a set in Python?', options: ['A list', 'An unordered collection of unique elements', 'A dictionary', 'A tuple'], correctIndex: 1 },
        { question: 'What is the purpose of with statement?', options: ['To create variables', 'To manage resources and ensure cleanup', 'To loop', 'To condition'], correctIndex: 1 },
        { question: 'What is slicing in Python?', options: ['Cutting strings', 'Extracting a portion of a sequence', 'Removing elements', 'Adding elements'], correctIndex: 1 },
        { question: 'What is the purpose of import statement?', options: ['To export', 'To import modules and their functions', 'To delete', 'To create'], correctIndex: 1 },
        { question: 'What is PEP 8?', options: ['A Python version', 'Python style guide', 'A library', 'A function'], correctIndex: 1 }
    ],
    'React': [
        { question: 'What is JSX?', options: ['A JavaScript library', 'A syntax extension for JavaScript', 'A CSS framework', 'A database'], correctIndex: 1 },
        { question: 'What is a React component?', options: ['A function or class that returns JSX', 'A variable', 'A loop', 'A database query'], correctIndex: 0 },
        { question: 'What is the purpose of useState hook?', options: ['To fetch data', 'To manage component state', 'To style components', 'To create routes'], correctIndex: 1 },
        { question: 'What is the purpose of useEffect hook?', options: ['To manage state', 'To perform side effects', 'To create components', 'To handle events'], correctIndex: 1 },
        { question: 'What is props in React?', options: ['Properties passed to components', 'A state management tool', 'A routing library', 'A styling framework'], correctIndex: 0 },
        { question: 'What is the virtual DOM?', options: ['A real DOM element', 'A JavaScript representation of the DOM', 'A CSS framework', 'A database'], correctIndex: 1 },
        { question: 'What is the difference between controlled and uncontrolled components?', options: ['No difference', 'Controlled uses state, uncontrolled uses refs', 'Uncontrolled uses state, controlled uses refs', 'Both use refs'], correctIndex: 1 },
        { question: 'What is React Router used for?', options: ['State management', 'Navigation and routing', 'Styling', 'Data fetching'], correctIndex: 1 },
        { question: 'What is the purpose of useMemo hook?', options: ['To memorize values', 'To memoize expensive computations', 'To store state', 'To fetch data'], correctIndex: 1 },
        { question: 'What is the purpose of useCallback hook?', options: ['To create callbacks', 'To memoize functions', 'To handle events', 'To manage state'], correctIndex: 1 },
        { question: 'What is a Higher Order Component (HOC)?', options: ['A component', 'A function that takes a component and returns a new component', 'A hook', 'A state'], correctIndex: 1 },
        { question: 'What is the purpose of keys in React lists?', options: ['To style elements', 'To help React identify which items have changed', 'To sort elements', 'To filter elements'], correctIndex: 1 },
        { question: 'What is React Context?', options: ['A component', 'A way to pass data through component tree without props', 'A hook', 'A state'], correctIndex: 1 },
        { question: 'What is the purpose of useRef hook?', options: ['To create references', 'To access DOM elements or persist values', 'To manage state', 'To fetch data'], correctIndex: 1 },
        { question: 'What is Redux?', options: ['A component', 'A state management library', 'A routing library', 'A styling framework'], correctIndex: 1 },
        { question: 'What is the purpose of React.memo?', options: ['To memorize', 'To prevent unnecessary re-renders', 'To store data', 'To fetch data'], correctIndex: 1 },
        { question: 'What is a custom hook?', options: ['A built-in hook', 'A reusable function that uses React hooks', 'A component', 'A state'], correctIndex: 1 },
        { question: 'What is the purpose of useReducer hook?', options: ['To reduce state', 'To manage complex state logic', 'To simplify state', 'To delete state'], correctIndex: 1 },
        { question: 'What is JSX transformation?', options: ['Converting JSX to HTML', 'Converting JSX to JavaScript function calls', 'Converting HTML to JSX', 'Converting JavaScript to JSX'], correctIndex: 1 },
        { question: 'What is the purpose of Fragment?', options: ['To create fragments', 'To group elements without adding extra DOM nodes', 'To style elements', 'To filter elements'], correctIndex: 1 }
    ],
    'Node.js': [
        { question: 'What is Node.js?', options: ['A database', 'A JavaScript runtime built on Chrome\'s V8', 'A CSS framework', 'A browser'], correctIndex: 1 },
        { question: 'What is npm?', options: ['Node Package Manager', 'Node Program Manager', 'Node Process Manager', 'Node Project Manager'], correctIndex: 0 },
        { question: 'What is the purpose of require()?', options: ['To export modules', 'To import modules', 'To create modules', 'To delete modules'], correctIndex: 1 },
        { question: 'What is Express.js?', options: ['A database', 'A web application framework', 'A CSS framework', 'A browser'], correctIndex: 1 },
        { question: 'What is middleware in Express?', options: ['A database', 'Functions that execute during request-response cycle', 'A routing mechanism', 'A template engine'], correctIndex: 1 },
        { question: 'What is the difference between require() and import?', options: ['No difference', 'require is CommonJS, import is ES6', 'import is CommonJS, require is ES6', 'Both are ES6'], correctIndex: 1 },
        { question: 'What is the purpose of process.env?', options: ['To access environment variables', 'To create variables', 'To delete variables', 'To modify the process'], correctIndex: 0 },
        { question: 'What is a callback function?', options: ['A function passed as an argument', 'A function that returns immediately', 'A synchronous function', 'A database query'], correctIndex: 0 },
        { question: 'What is the event loop in Node.js?', options: ['A type of loop', 'A mechanism that handles asynchronous operations', 'A database query', 'A routing mechanism'], correctIndex: 1 },
        { question: 'What is the purpose of package.json?', options: ['To store packages', 'To define project metadata and dependencies', 'To run scripts', 'To create modules'], correctIndex: 1 },
        { question: 'What is a stream in Node.js?', options: ['A flow', 'An abstract interface for working with streaming data', 'A file', 'A database'], correctIndex: 1 },
        { question: 'What is the purpose of fs module?', options: ['To fetch data', 'To interact with the file system', 'To create servers', 'To handle routes'], correctIndex: 1 },
        { question: 'What is the purpose of path module?', options: ['To find paths', 'To handle and transform file paths', 'To create paths', 'To delete paths'], correctIndex: 1 },
        { question: 'What is the difference between readFile and readFileSync?', options: ['No difference', 'readFile is async, readFileSync is synchronous', 'readFileSync is async, readFile is synchronous', 'Both are async'], correctIndex: 1 },
        { question: 'What is the purpose of http module?', options: ['To create HTTP servers and clients', 'To fetch data', 'To handle routes', 'To create middleware'], correctIndex: 0 },
        { question: 'What is a buffer in Node.js?', options: ['A type of data', 'A region of memory for handling binary data', 'A file', 'A stream'], correctIndex: 1 },
        { question: 'What is the purpose of cluster module?', options: ['To create clusters', 'To create child processes to handle load', 'To manage files', 'To handle routes'], correctIndex: 1 },
        { question: 'What is the purpose of crypto module?', options: ['To create crypto', 'To provide cryptographic functionality', 'To encrypt files', 'To decrypt files'], correctIndex: 1 },
        { question: 'What is the purpose of util module?', options: ['To use utilities', 'To provide utility functions', 'To create modules', 'To delete modules'], correctIndex: 1 },
        { question: 'What is the purpose of child_process module?', options: ['To create children', 'To spawn child processes', 'To manage files', 'To handle routes'], correctIndex: 1 }
    ],
    'SQL': [
        { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'], correctIndex: 0 },
        { question: 'What is the purpose of SELECT statement?', options: ['To insert data', 'To retrieve data', 'To delete data', 'To update data'], correctIndex: 1 },
        { question: 'What is a primary key?', options: ['A foreign key', 'A unique identifier for a row', 'A type of join', 'A database name'], correctIndex: 1 },
        { question: 'What is the difference between INNER JOIN and LEFT JOIN?', options: ['No difference', 'INNER returns matching rows, LEFT returns all left rows', 'LEFT returns matching rows, INNER returns all left rows', 'Both return all rows'], correctIndex: 1 },
        { question: 'What is the purpose of WHERE clause?', options: ['To filter rows', 'To sort rows', 'To group rows', 'To join tables'], correctIndex: 0 },
        { question: 'What is a foreign key?', options: ['A primary key', 'A key that references another table', 'A unique constraint', 'A database name'], correctIndex: 1 },
        { question: 'What does GROUP BY do?', options: ['Groups rows by a column', 'Sorts rows', 'Filters rows', 'Joins tables'], correctIndex: 0 },
        { question: 'What is the purpose of HAVING clause?', options: ['To filter rows', 'To filter groups', 'To sort rows', 'To join tables'], correctIndex: 1 },
        { question: 'What is the difference between DELETE and TRUNCATE?', options: ['No difference', 'DELETE removes specific rows, TRUNCATE removes all rows', 'TRUNCATE removes specific rows, DELETE removes all rows', 'Both remove specific rows'], correctIndex: 1 },
        { question: 'What is an index in SQL?', options: ['A table', 'A data structure that improves query performance', 'A type of join', 'A database name'], correctIndex: 1 },
        { question: 'What is the purpose of ORDER BY?', options: ['To order tables', 'To sort result set by columns', 'To filter rows', 'To join tables'], correctIndex: 1 },
        { question: 'What is a view in SQL?', options: ['A table', 'A virtual table based on result of a query', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is the purpose of UNION?', options: ['To combine tables', 'To combine result sets of two queries', 'To join tables', 'To filter rows'], correctIndex: 1 },
        { question: 'What is a stored procedure?', options: ['A function', 'A prepared SQL code that can be reused', 'A table', 'A database'], correctIndex: 1 },
        { question: 'What is the purpose of DISTINCT?', options: ['To select distinct tables', 'To return unique values', 'To filter rows', 'To sort rows'], correctIndex: 1 },
        { question: 'What is a transaction?', options: ['A query', 'A sequence of operations performed as a single unit', 'A table', 'A database'], correctIndex: 1 },
        { question: 'What is ACID in database?', options: ['A chemical', 'Atomicity, Consistency, Isolation, Durability', 'A database type', 'A query type'], correctIndex: 1 },
        { question: 'What is the purpose of LIMIT?', options: ['To limit tables', 'To limit number of rows returned', 'To filter rows', 'To sort rows'], correctIndex: 1 },
        { question: 'What is a subquery?', options: ['A small query', 'A query nested inside another query', 'A simple query', 'A complex query'], correctIndex: 1 },
        { question: 'What is normalization?', options: ['To normalize data', 'To organize data to reduce redundancy', 'To denormalize data', 'To duplicate data'], correctIndex: 1 }
    ],
    'Data Analysis': [
        { question: 'What is the purpose of data cleaning?', options: ['To remove all data', 'To prepare data for analysis by removing errors', 'To add more data', 'To sort data'], correctIndex: 1 },
        { question: 'What is a pivot table?', options: ['A type of chart', 'A summary table that reorganizes data', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is correlation?', options: ['A type of chart', 'A measure of relationship between variables', 'A database query', 'A function'], correctIndex: 1 },
        { question: 'What is the purpose of data visualization?', options: ['To hide data', 'To present data in graphical form', 'To delete data', 'To sort data'], correctIndex: 1 },
        { question: 'What is a histogram?', options: ['A type of chart showing frequency distribution', 'A database', 'A function', 'A type of table'], correctIndex: 0 },
        { question: 'What is the mean?', options: ['The middle value', 'The average value', 'The most common value', 'The highest value'], correctIndex: 1 },
        { question: 'What is the median?', options: ['The average value', 'The middle value', 'The most common value', 'The highest value'], correctIndex: 1 },
        { question: 'What is standard deviation?', options: ['A type of chart', 'A measure of data spread', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is regression analysis?', options: ['A type of chart', 'A statistical method to model relationships', 'A database query', 'A function'], correctIndex: 1 },
        { question: 'What is a scatter plot?', options: ['A type of table', 'A chart showing relationship between two variables', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is the mode?', options: ['The average value', 'The most frequently occurring value', 'The middle value', 'The highest value'], correctIndex: 1 },
        { question: 'What is variance?', options: ['A type of chart', 'A measure of how spread out data is', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is outlier detection?', options: ['Finding normal values', 'Identifying values that differ significantly from others', 'Removing all values', 'Adding values'], correctIndex: 1 },
        { question: 'What is data transformation?', options: ['Deleting data', 'Converting data from one format to another', 'Copying data', 'Storing data'], correctIndex: 1 },
        { question: 'What is exploratory data analysis (EDA)?', options: ['Final analysis', 'Initial investigation of data to discover patterns', 'No analysis', 'Simple analysis'], correctIndex: 1 },
        { question: 'What is a box plot?', options: ['A type of chart', 'A chart showing distribution of data', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is hypothesis testing?', options: ['Guessing', 'Statistical method to test assumptions', 'No testing', 'Random testing'], correctIndex: 1 },
        { question: 'What is data sampling?', options: ['Using all data', 'Selecting a subset of data for analysis', 'Deleting data', 'Copying data'], correctIndex: 1 },
        { question: 'What is time series analysis?', options: ['Static analysis', 'Analyzing data points collected over time', 'Random analysis', 'No analysis'], correctIndex: 1 },
        { question: 'What is data aggregation?', options: ['Separating data', 'Combining multiple data points into summary', 'Deleting data', 'Copying data'], correctIndex: 1 }
    ],
    'Product Management': [
        { question: 'What is a product roadmap?', options: ['A map', 'A strategic plan for product development', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is the purpose of user stories?', options: ['To tell stories', 'To describe features from user perspective', 'To create designs', 'To write code'], correctIndex: 1 },
        { question: 'What is MVP?', options: ['Most Valuable Player', 'Minimum Viable Product', 'Maximum Value Product', 'Most Valuable Product'], correctIndex: 1 },
        { question: 'What is the purpose of A/B testing?', options: ['To test code', 'To compare two versions of a feature', 'To create designs', 'To write documentation'], correctIndex: 1 },
        { question: 'What is a user persona?', options: ['A real user', 'A fictional representation of target user', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is the purpose of sprint planning?', options: ['To plan sprints', 'To plan work for a sprint', 'To create designs', 'To write code'], correctIndex: 1 },
        { question: 'What is a product backlog?', options: ['A list of completed items', 'A prioritized list of work items', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is the purpose of user research?', options: ['To research users', 'To understand user needs and behaviors', 'To create designs', 'To write code'], correctIndex: 1 },
        { question: 'What is product-market fit?', options: ['A type of product', 'When a product meets market demand', 'A database', 'A function'], correctIndex: 1 },
        { question: 'What is the purpose of analytics?', options: ['To analyze data', 'To measure product performance', 'To create designs', 'To write code'], correctIndex: 1 },
        { question: 'What is a feature flag?', options: ['A flag', 'A technique to enable/disable features without deployment', 'A design', 'A code'], correctIndex: 1 },
        { question: 'What is the purpose of competitive analysis?', options: ['To analyze competitors', 'To understand competitive landscape', 'To copy competitors', 'To ignore competitors'], correctIndex: 1 },
        { question: 'What is a release plan?', options: ['A plan', 'A plan for releasing product features', 'A design', 'A code'], correctIndex: 1 },
        { question: 'What is the purpose of stakeholder management?', options: ['To manage stakeholders', 'To manage relationships with stakeholders', 'To ignore stakeholders', 'To avoid stakeholders'], correctIndex: 1 },
        { question: 'What is a product requirement document (PRD)?', options: ['A document', 'A document describing product requirements', 'A design', 'A code'], correctIndex: 1 },
        { question: 'What is the purpose of user acceptance testing (UAT)?', options: ['To test users', 'To test product with end users', 'To test code', 'To test designs'], correctIndex: 1 },
        { question: 'What is a go-to-market strategy?', options: ['A strategy', 'A plan for launching product to market', 'A design', 'A code'], correctIndex: 1 },
        { question: 'What is the purpose of metrics and KPIs?', options: ['To measure', 'To measure product success', 'To test code', 'To create designs'], correctIndex: 1 },
        { question: 'What is agile methodology?', options: ['A method', 'An iterative approach to product development', 'A design method', 'A coding method'], correctIndex: 1 },
        { question: 'What is the purpose of customer feedback?', options: ['To get feedback', 'To improve product based on user input', 'To ignore users', 'To test code'], correctIndex: 1 }
    ]
};

async function seedSkills() {
    try {
        console.log('Starting to seed skills and questions...\n');

        // Get all existing skills from database
        const allExistingSkills = await db.select().from(skills);
        const existingSkillNames = new Set(allExistingSkills.map(s => s.name));

        // Combine new skills with existing skills that need questions
        const allSkillsToProcess = [...new Set([...newSkills, ...allExistingSkills.map(s => s.name)])];

        // Add skills
        for (const skillName of allSkillsToProcess) {
            // Check if skill already exists
            const existingSkills = await db
                .select()
                .from(skills)
                .where(eq(skills.name, skillName));

            let skillId: number;

            if (existingSkills.length > 0) {
                skillId = existingSkills[0].id;
                console.log(`Skill "${skillName}" already exists with ID ${skillId}`);
            } else {
                // Insert new skill
                const result = await db
                    .insert(skills)
                    .values({ name: skillName })
                    .returning();
                skillId = result[0].id;
                console.log(`Added skill "${skillName}" with ID ${skillId}`);
            }

            // Check existing questions for this skill
            const existingQuestions = await db
                .select()
                .from(skillQuestions)
                .where(eq(skillQuestions.skillId, skillId));

            // Get questions for this skill
            const questionsToAdd = skillQuestionsData[skillName] || [];

            if (questionsToAdd.length === 0) {
                console.log(`No questions found for "${skillName}", skipping...`);
                continue;
            }

            // Get existing question texts to avoid duplicates
            const existingQuestionTexts = new Set(existingQuestions.map(q => q.question));

            // Filter out questions that already exist
            const newQuestions = questionsToAdd.filter(q => !existingQuestionTexts.has(q.question));

            // Ensure we have at least 15 questions, add up to 20
            const targetCount = 20;
            const currentCount = existingQuestions.length;
            const questionsNeeded = Math.max(0, targetCount - currentCount);

            if (questionsNeeded > 0 && newQuestions.length > 0) {
                const questionsToInsert = newQuestions
                    .slice(0, Math.min(questionsNeeded, newQuestions.length))
                    .map(q => ({
                        skillId: skillId,
                        question: q.question,
                        options: q.options,
                        correctIndex: q.correctIndex,
                    }));

                if (questionsToInsert.length > 0) {
                    await db.insert(skillQuestions).values(questionsToInsert);
                    console.log(`Added ${questionsToInsert.length} questions to "${skillName}" (now has ${currentCount + questionsToInsert.length} questions)`);
                }
            } else if (currentCount >= 15) {
                console.log(`Skill "${skillName}" already has ${currentCount} questions (target: 15-20), skipping...`);
            } else {
                console.log(`Skill "${skillName}" has ${currentCount} questions but no new questions available to add.`);
            }
        }

        console.log('\n✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding skills:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Run the seeding function
seedSkills()
    .then(() => {
        console.log('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });

