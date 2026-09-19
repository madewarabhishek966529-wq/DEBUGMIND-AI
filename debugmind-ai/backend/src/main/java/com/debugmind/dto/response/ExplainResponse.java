package com.debugmind.dto.response;

public class ExplainResponse {
    private String whatIsWrong;
    private String whyItHappens;
    private String whereItHappens;
    private String impact;
    private String howToFix;
    private String explanation;

    public ExplainResponse() {}

    public ExplainResponse(String whatIsWrong, String whyItHappens, String whereItHappens,
                           String impact, String howToFix, String explanation) {
        this.whatIsWrong = whatIsWrong;
        this.whyItHappens = whyItHappens;
        this.whereItHappens = whereItHappens;
        this.impact = impact;
        this.howToFix = howToFix;
        this.explanation = explanation;
    }

    public String getWhatIsWrong() { return whatIsWrong; }
    public void setWhatIsWrong(String whatIsWrong) { this.whatIsWrong = whatIsWrong; }

    public String getWhyItHappens() { return whyItHappens; }
    public void setWhyItHappens(String whyItHappens) { this.whyItHappens = whyItHappens; }

    public String getWhereItHappens() { return whereItHappens; }
    public void setWhereItHappens(String whereItHappens) { this.whereItHappens = whereItHappens; }

    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }

    public String getHowToFix() { return howToFix; }
    public void setHowToFix(String howToFix) { this.howToFix = howToFix; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
