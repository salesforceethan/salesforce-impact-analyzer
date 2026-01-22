@IsTest
public class LeadProcessorTest {

    @IsTest
    static void testBatchUpdatesLeadSource() {
        // Create 200 Leads
        List<Lead> leads = new List<Lead>();
        for (Integer i = 0; i < 200; i++) {
            leads.add(new Lead(
                LastName = 'Test ' + i,
                Company  = 'Test Company',
                LeadSource = 'Web'
            ));
        }
        insert leads;

        Test.startTest();
        // Execute the batch (scope size optional; 200 is fine)
        Database.executeBatch(new LeadProcessor(), 200);
        Test.stopTest(); // Forces batch to finish in test context

        // Verify all Leads were updated
        Integer updatedCount = [
            SELECT COUNT()
            FROM Lead
            WHERE LeadSource = 'Dreamforce'
        ];

        System.assertEquals(200, updatedCount, 'All leads should have LeadSource = Dreamforce');
    }
}