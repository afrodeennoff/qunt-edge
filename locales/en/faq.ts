export default {
    faq: {
        heading: 'Frequently Asked Questions',
        question1: 'Does Qunt Edge trade for me?',
        answer1: 'No, Qunt Edge is not a brokerage. You execute trades on your broker and then transfer the data into Qunt Edge to track and analyze your trading performance.',
        question2: 'How secure is Qunt Edge?',
        answer2: 'Your data security is our top priority. Qunt Edge does not sell or advertise your data, and we employ industry-standard security measures to protect your information.',
        question3: 'How Qunt Edge syncs my trading history:',
        answer3: 'We have developed our own syncing services with Rithmic, Tradovate and the Thor copier. They both work differently. Rithmic for example, doesn\'t allow OAuth, and for security reasons we don\'t store your credentials. They are securely stored on your computer and accessed from the Qunt Edge sync engine only when you\'re connected. Tradovate on the other hand allows OAuth flow, which enables Qunt Edge to request a read access to your trading history and back up your trades daily even if you don\'t log to Qunt Edge. Finally Thor works by saving all your trading data on their server and you decide when to upload your data to Qunt Edge using their software.',
        question4: 'How to update to latest version?',
        answer4: 'Qunt Edge operates as a web app which allows updates to reflect instantly in your browser. You don\'t need to run updates.',
        question5: 'Is it possible to run Qunt Edge locally?',
        answer5: 'Qunt Edge isn\'t available for local deployment as you won\'t be able to use sync services (which require conformance) but we are working on a local version with full support for .csv and .pdf uploads',
        question6: 'Why Pro plan doesn\'t provide a trial period?',
        answer6: 'Qunt Edge offers a free version (Basic) with up to 30 days of data storage. This provides enough time to evaluate the platform and see the value of AI-powered insights before upgrading to Pro for unlimited history.',
    },
} as const;
