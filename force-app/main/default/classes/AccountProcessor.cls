public class AccountProcessor {
 @future
    public static void countContacts(List<Id> accountIds) {
        // Safety check (also helps with code robustness and test coverage)
        if (accountIds == null || accountIds.isEmpty()) {
            return;
        }

        // Count Contacts per Account using an aggregate query
        Map<Id, Integer> accountIdToContactCount = new Map<Id, Integer>();

        for (AggregateResult ar : [
            SELECT AccountId acctId, COUNT(Id) cnt
            FROM Contact
            WHERE AccountId IN :accountIds
            GROUP BY AccountId
        ]) {
            accountIdToContactCount.put(
                (Id) ar.get('acctId'),
                (Integer) ar.get('cnt')
            );
        }

        // Update Accounts with the count (0 if none)
        List<Account> accountsToUpdate = new List<Account>();

        for (Account a : [
            SELECT Id, Number_Of_Contacts__c
            FROM Account
            WHERE Id IN :accountIds
        ]) {
            Integer cnt = accountIdToContactCount.containsKey(a.Id)
                ? accountIdToContactCount.get(a.Id)
                : 0;

            a.Number_Of_Contacts__c = cnt;
            accountsToUpdate.add(a);
        }

        if (!accountsToUpdate.isEmpty()) {
            update accountsToUpdate;
        }
    }
}