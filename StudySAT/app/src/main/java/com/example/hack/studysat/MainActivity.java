package com.example.hack.studysat;

import android.graphics.Color;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Random;

public class MainActivity extends AppCompatActivity {
    ArrayList<Question> qs = new ArrayList<Question>();
    ArrayList<Repeat> repeat = new ArrayList<Repeat>();
    ArrayList<Question> end = new ArrayList<Question>();
    ArrayList<Study> study = new ArrayList<Study>();
    Random r;
    int currentQ;
    int currentSelected=-1;
    int score = 0;
    int question = 0;

    boolean next = false;

    TextView q;
    RadioButton[] ans;
    Button go;
    TextView questComp;
    TextView scoreTxt;
    LinearLayout ll;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        q =(TextView)findViewById(R.id.def);
        ans =new RadioButton[]{(RadioButton)findViewById(R.id.a),(RadioButton)findViewById(R.id.b),(RadioButton)findViewById(R.id.c),(RadioButton)findViewById(R.id.d)};
        go = (Button)findViewById(R.id.button);
        questComp = (TextView)findViewById(R.id.qc);
        scoreTxt = (TextView)findViewById(R.id.score);
        ll = (LinearLayout)findViewById(R.id.lin);

        for (int i =0;i<4;i++){
            ans[i].setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    switch(v.getId()){
                        case R.id.a:
                            currentSelected = 0;
                            break;
                        case R.id.b:
                            currentSelected = 1;
                            break;
                        case R.id.c:
                            currentSelected = 2;
                            break;
                        case R.id.d:
                            currentSelected = 3;
                            break;
                    }
                    for (int i = 0; i<4;i++){
                        if (i!=currentSelected){
                            ans[i].setChecked(false);
                        }
                    }
                    go.setEnabled(true);
                }
            });
            go.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    next = !next;

                    if (next) {
                        go.setText("Next");
                        question++;
                        questComp.setText("Questions Completed: " + String.valueOf(question));

                        int studyIndex = study.size();
                        boolean alreadyContains = false;
                        for (int i =0; i<study.size();i++){
                            if (study.get(i).word.equals(qs.get(currentQ).q)){
                                alreadyContains = true;
                                studyIndex = i;
                                break;
                            }
                        }

                        if(!alreadyContains){
                            study.add(new Study(qs.get(currentQ).q,0,0));
                        }
                        for (int i = 0; i < repeat.size(); i++) repeat.get(i).countdwn--;
                        for (int i = 0; i < 4; i++) {
                            ans[i].setEnabled(false);
                            ans[i].setChecked(false);
                        }
                        end.add(qs.get(currentQ));
                        if (qs.get(currentQ).rightIn == currentSelected) {
                            ans[currentSelected].setBackgroundColor(Color.GREEN);
                            score++;
                            study.get(studyIndex).correct++;


                        } else {
                            ans[currentSelected].setBackgroundColor(Color.RED);
                            ans[qs.get(currentQ).rightIn].setBackgroundColor(Color.GREEN);
                            repeat.add(new Repeat(qs.get(currentQ)));
                            study.get(studyIndex).missed++;
                        }
                        ll.removeAllViews();
                        for (int i = study.size()-1;i>=0;i--){

                            TextView tv = new TextView(getApplicationContext());
                            tv.setText(study.get(i).word + "(+" + String.valueOf(study.get(i).correct)+",-"+String.valueOf(study.get(i).missed)+")");
                            tv.setTextColor(Color.BLACK);
                            ll.addView(tv);
                        }
                        scoreTxt.setText("Percent Correct: " + String.valueOf((int)((double)score*100/(double)question)));
                        qs.remove(currentQ);
                    } else {
                        go.setText("Submit");
                        for (int i = 0; i < 4; i++) {
                            ans[i].setEnabled(true);
                            ans[i].setBackgroundColor(Color.WHITE);
                        }
                        setQuestion();
                    }

                }
            });
        }
        beginning();
    }
    void beginning(){
        r = new Random();
        qs.removeAll(qs);
        end.removeAll(end);
        repeat.removeAll(repeat);
        qs.add(new Question("Which is an animal?", "dog", "table", "tree", "apple"));
        qs.add(new Question("Which is NOT a direction?", "turn", "east", "south", "north"));
        qs.add(new Question ("Which is a drink?","water","orange","paper","can"));
        qs.add(new Question("Which is a noun?","computer","eating","slowly","run"));
        qs.add(new Question("Which is NOT a family member?","teacher","uncle","grandmother","cousin"));
        qs.add(new Question("Which is the earliest time?","morning","afternoon","evening","night"));
        qs.add(new Question("Which is NOT a season?","March","summer","fall","winter"));
        qs.add(new Question("Which is NOT bright?","tunnel","star","lamp","moon"));
        qs.add(new Question("What is nine plus ten?","19","21","10","90"));
        qs.add(new Question("What is twelve times six","72","84","18","6"));
        qs.add(new Question("What is fifteen minus nine?","6","23","45","8"));
        qs.add(new Question("What is eleven divided by eleven","1","22","121","0"));
       /* qs.add(new Question("What is twenty minus thirteen?","7","33","15","17"));
        qs.add(new Question("What is the square root of thirty-six?","6","5","36","100"));
        qs.add(new Question("What is thirty-five divided by two?","17.5","16.2","15","16.5"));
        qs.add(new Question("What is zero times ten?","0","10","1","100"));
        qs.add(new Question("What is twenty-two plus twenty-eight?","50","6","30","48"));
        qs.add(new Question("What is two divided by one?","2","1","0","0.5"));*/

        go.setEnabled(false);
        for (int i = 0; i<4;i++) {
            ans[i].setEnabled(true);
            ans[i].setChecked(false);
            ans[i].setBackgroundColor(Color.WHITE);
        }

        questComp.setText("Questions Completed: 0");
        scoreTxt.setText("Percent Correct: 0");
        score = 0;
        question  = 0;

        setQuestion();
    }
    void setQuestion(){
        String[] abcd = new String[]{"a. ","b. ","c. ","d. "};
        if (repeat.size()>0) {
            if (repeat.get(0).countdwn == 0) {
                qs.add(repeat.get(0).qs);
                repeat.remove(0);
                currentQ = qs.size() - 1;
                qs.get(currentQ).shuffle();
            }else{
                if (qs.size()==0){
                    if (repeat.size()>0){
                        qs.add(repeat.get(0).qs);
                        repeat.remove(0);
                        currentQ = qs.size()-5;
                        qs.get(currentQ).shuffle();
                    }
                    else{
                        qs.addAll(end);
                        int ran =r.nextInt(qs.size());
                        qs.get(ran).shuffle();
                        currentQ = ran;
                    }
                }
                int ran =r.nextInt(qs.size());
                qs.get(ran).shuffle();
                currentQ = ran;
            }

        }
        else{
            if (qs.size()==0){
                qs.addAll(end);
                int ran =r.nextInt(qs.size()-1);
                qs.get(ran).shuffle();
                currentQ = ran;
            }
            int ran =r.nextInt(qs.size());
            qs.get(ran).shuffle();
            currentQ = ran;
        }
        for (int i =0;i<4;i++) {
            ans[i].setText(abcd[i]+qs.get(currentQ).quest[i]);
        }
        q.setText(qs.get(currentQ).q);

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
        if (id == R.id.action_reset){
            beginning();
        }

        //noinspection SimplifiableIfStatement

        return super.onOptionsItemSelected(item);
    }
}
class Question{
    String q;
    String right;
    String wrong1;
    String wrong2;
    String wrong3;
    int rightIn = 0;
    String[] quest;
    Random ran;
    public Question(String q,String r,String w1,String w2,String w3){
        this.q= q;
        this. right = r;
        this.wrong1 = w1;
        this.wrong2 = w2;
        this.wrong3 = w3;
        ran = new Random();
    }
    void shuffle(){
        String[] temp = new String[]{right,wrong1,wrong2,wrong3};
        quest = new String[4];
        for (int i = 0;i<4;i++){
            int num = ran.nextInt(4-i);
            quest[i] = temp[num];

            if (temp[num].equals(this.right)) rightIn = i;
            temp[num] = temp[3-i];
        }
    }
}
class Repeat{
    int countdwn = 3;
    Question qs;
    public Repeat(Question q){
        this.qs = q;
    }
}
class Study{
    String word;
    int missed;
    int correct;
    Study(String word, int missed, int correct){
        this.word = word;
        this.missed = missed;
        this.correct = correct;
    }

}
