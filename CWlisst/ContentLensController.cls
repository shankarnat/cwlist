public with sharing class ContentLensController {
    
    @RemoteAction
    global static List<ContentLens> getLenses() {
        List<ContentLens> lenses = new List<ContentLens>();
        
        // Query your custom object or return mock data
        // Example with mock data:
        lenses.add(new ContentLens('L-00001', 'Marketing Lens', 'Published', 'Marketing content', DateTime.now().addDays(-1)));
        lenses.add(new ContentLens('L-00002', 'HR Lens', 'Draft', 'HR docs', DateTime.now().addDays(-2)));
        lenses.add(new ContentLens('L-00003', 'Finance Lens', 'Published', 'Finance data', DateTime.now()));
        
        return lenses;
    }
    
    @RemoteAction
    global static ContentLens saveLens(String name, String description, String status) {
        // Implement your save logic here
        // For now, return a mock response
        String newId = 'L-' + String.valueOf(Math.round(Math.random() * 10000)).leftPad(5, '0');
        return new ContentLens(newId, name, status, description, DateTime.now());
    }
    
    @RemoteAction
    global static List<ContentLens> cloneLenses(List<String> lensIds) {
        List<ContentLens> clonedLenses = new List<ContentLens>();
        
        // Implement your clone logic here
        for (String lensId : lensIds) {
            // Mock implementation
            String newId = 'L-' + String.valueOf(Math.round(Math.random() * 10000)).leftPad(5, '0');
            clonedLenses.add(new ContentLens(newId, 'Cloned Lens', 'Draft', 'Cloned from ' + lensId, DateTime.now()));
        }
        
        return clonedLenses;
    }
    
    global class ContentLens {
        public String id { get; set; }
        public String name { get; set; }
        public String status { get; set; }
        public String description { get; set; }
        public DateTime lastRefreshed { get; set; }
        
        public ContentLens(String id, String name, String status, String description, DateTime lastRefreshed) {
            this.id = id;
            this.name = name;
            this.status = status;
            this.description = description;
            this.lastRefreshed = lastRefreshed;
        }
    }
}