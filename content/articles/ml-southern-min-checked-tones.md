## 1. 序論

閩南語の入声韻尾（k, p, t, P）は音韻論的には明確な対立を形成するが，音響的には持続時間，フォルマント遷移，エネルギー減衰，声門特性など複数の次元に分散した手がかりによって実現されるため，その可分性は必ずしも自明ではない。先行研究では，時間構造や終末部の音響的変化が弁別に寄与することが示唆されているが，これらの手がかりが統合された場合にどの程度カテゴリー的分類が可能となるのか，また人間の知覚精度と音響的可分性との対応関係については十分に定量化されていない。[4]一方，声調は主として基本周波数（F0）に依存することが知られているが，声質や終末部の構造が補助的にどの程度寄与するのかについても体系的検証は限られている。先行研究は機械学習により, トーンと子音種類の分類タスク及び重要性の計算の可能性を証明した。[1] [5] [7] [6]本研究は，機械学習モデルを用いて入声韻尾4分類および声調2 分類の音響的可分類性を検証し，第一に，音響特徴のみからどの程度の精度で予測可能かを評価することで，自由変異(free variation) や音響的重なりを含む実証的限界を明らかにすること，第二に，特徴量重要度分析を通じて各音響手がかりの寄与を定量化し，人間知覚実験との比較により発声（production）と認識（perception）の関係を再考することを目的とする。

Re-think the Checked Tones in Southern Min by Machine Learning Jeremy Lim, International Christian University

## 2. 方法

### 2.1. データ

本研究では，台湾閩南語の入声韻尾/k, p, t, P/ を含む単音節語96 トークン（話者4 名）を分析対象とした。音響特徴として，openSMILEによるeGeMAPSv02 Functionals（88 特徴）およびMFCC（32 次元）を抽出し，時間窓分割（母音0–40%，共調域40–60%，韻尾60–100%）に基づく統計量（平均値・傾き）を加えた。さらに，事前学習済み自己教師あり音声表現モデルであるwav2vec2.0 から得られる埋め込み特徴を統合し，音響特徴との組み合わせによるHybrid 特徴セットを構築した。話者間変動を統制するため，各話者ごとにZ スコア正規化を施した。人間知覚データとして，韓国語・北京語・英語・日本語・閩南語の5 言語背景（計65名）の韻尾識別結果を用い，各群の混同行列を取得した。

### 2.2. 実験

入声韻尾について4 値分類および階層分類（第1 段階：/P/ vs 口腔閉鎖音，第2 段階：/k, p, t/）を実施した。検証はLeave-One-Out Cross Validation（LOO-CV）により行い，各fold で1 トークンをテストとし，残りを訓練とした。

データ拡張（速度0.9 倍・1.1 倍，SNR 20dBノイズ）は訓練データのみに適用した。評価指標はAccuracy およびMacro-F1 とし，混同行列により誤分類傾向を分析した。特徴量はF0，フォルマント，エネルギー，声質，スペクトル，MFCCs，継続時間の各グループに分類し，Random Forest によるGini Importance，Permutation Importance，およびAblation（F1低下量）を算出した。最後に，機械分類と各言語群の混同行列を行正規化後に比較し，非対角成分の相関係数を用いて人間知覚との対応関係を検討した。

## 3. 結果

### 3.1. 分類精度

図1 に入声韻尾および声調の分類精度を示す。入声韻尾4 値分類において，eGeMAPS のみを用いたBaseline 条件では全分類器が45%～54%（LR: 47%，SVM: 52%，RF: 45%，MLP:

## 54. %）にとどまったが，時間窓特徴・データ拡

張・階層型分類を統合したAugmented 条件では全分類器で精度が向上し，階層型MLP が68%で最良であった。声調2 値分類ではBaseline 条件においてすでに79%～87%（RF: 87%）と高精度を示し，Augmented 条件では82%～85% の範囲で推移した。

wav2vec2 特徴を加えたHybrid 条件（図2）では，入声韻尾分類においてMLP（Acc =

### 0.779. ，Macro-F1 = 0.780）が最高性能を示し，

Augmented 条件の68% をさらに上回った。LR（Acc = 0.705）およびSVM-RBF（Acc = 0.642）も安定した性能を示した一方，Random Forest（Acc = 0.537）は他の3 モデルを大きく下回り，高次元特徴空間における汎化の限界が示された。

### 3.2. 学習曲線

図3・図4 にMLP の学習曲線を示す。韻尾・声調いずれの課題においても，training loss は初期に急減し約50 エポックで収束，training accuracy はほぼ100% に達した。一方，テスト精度は韻尾68%，声調85% にとどまり，特に韻尾分類においてはモデルの汎化が制限されていることが示唆された。

### 3.3. 特徴量重要度

図5 にAblation study の結果を示す。韻尾分類では，MFCCs およびCPP の除去が精度低下に最も寄与し，スペクトル特徴の重要性が確認された。声調分類ではスペクトル特徴およびMFCCs の寄与が大きく，F0 やFormants 単独の影響は相対的に小さかった。

図6・図7 のRandom Forest Gini 重要度においては，韻尾分類ではDuration（0.0158）が最大寄与を示し，CPP（0.0075），Harmonics（0.0073），Energy/Loudness（0.0063）が続いた。声調分類ではCPP（0.0198）が最上位であり，Voice Quality（0.0089），F0（0.0067）の順であった。

両課題で特徴量の構造が質的に異なることが示された。

### 3.4. 誤分類傾向

図8 に韻尾分類の誤分類分析を示す。最頻誤分類は/p/→/t/（7 例）であり，/k/→/p/，/k/ →/t/，/p/→/k/ が各5 例と続いた。クラス別正答率では声門閉鎖音が92% と最も高く，/k/（54%）および/p/（50%）は低値であり，口腔閉鎖音間の多方向混同が確認された。話者別ではS3 が最多誤分類（10 例），S1 が最少（5 例）であり，話者間変動が観察された。

図9 に声調分類の結果を示す。High →Lowが8 例，Low →High が6 例と誤りは両方向に分布し，クラス別正答率はHigh 83%，Low 88%であった。韻尾分類と比較して，話者間変動が小さく，全体的な分離可能性が高いことが示された。

### 3.5. 人間知覚との比較

図10 に人間と最良MLP の比較を示す。全体精度は韻尾で人間60%・機械68%，声調で人間71%・機械85% であり，いずれの課題においても機械モデルが人間の平均を上回った。クラス別では，声門閉鎖音（人間78%・機械92%）および/t/（人間55%・機械78%）において機械が優位であった。一方，/p/ においては人間（69%）が機械（50%）を上回る唯一の例外が観察された。声調分類ではHigh・Low いずれにおいても機械が人間を上回り（High: 83% vs.

## 65. %，Low: 88% vs. 75%），精度差はクラス全

体で正の方向に偏った（図10 右下）。

## 4. 考察

### 4.1. 時間窓分割と特徴統合の効果

Augmented 条件における精度向上は，時間窓分割（共調域40–60%・韻尾域60–100%）の導入が主要な寄与因子であることを示す。口腔閉鎖音間の弁別に有効な音響手がかり̶̶ /p/の低F1，/t/ の高F2̶̶は共調域に集中しており，/k/ の高F3 は韻尾域において顕現する[3]。この時間的局在性を考慮した窓分割設計により，モデルが音韻的に意味のある時系列区間に選択的に注目できたことが精度向上の主因と考えられる。

一方，声調分類ではAugmented 条件での改善幅が限定的であり，特徴量の追加がわずかな精度低下を招く場合も見られた。声調弁別はF0 を主要手がかりとする比較的単純な課題であるため，過剰な特徴量がノイズとして機能し汎化を妨げた可能性がある。この結果は，声調分類における特徴選択の重要性を示す。

### 4.2. wav2vec2 統合の意義と限界

Hybrid 条件においてMLP は最高成績を示した人間被験者群（韓国語話者）の正答率に近接する水準に達した。これは，台湾閩南語の入声韻尾が原理的には音響的に分離可能であることを示す一方，残存する約20% の誤分類は自由変異̶̶例えば「合」がhak ともhap とも発音される等の変異[4]̶̶や不規則発音に起因する識別限界を反映する。タイ語や韓国語の語末閉鎖音が高精度で識別されることと対比すると，閩南語入声韻尾の識別困難は，音素レベルの情報の不明瞭さを語・文レベルの文脈情報が補完するという音韻類型論的に特異な情報構造を示唆する。閩南語話者はこの二重構造に依存して音声理解を実現している可能性がある[3]。

ただし，wav2vec2 の埋め込み表現（768 次元）はブラックボックスであり，どの次元がどの音響手がかりに対応するかを検証する手段がない。したがって，wav2vec2 は分類精度において最高であるが，音声知覚研究における手がかり重要度の解釈には不適切である。以降の考察は，透明性を持ちながら高い精度を示すグレーボックスモデルとしてのMLP を中心に展開する。

### 4.3. 音響手がかりの重要度と音声学的解釈

韻尾分類においてDuration が最大寄与を示したことは，P が他の口腔閉鎖音に比べ有意に長い母音持続時間を示すという知見と整合し[3]，Duration が主としてP と/k, p, t/ を分離する一次手がかりとして機能することを示す。CPP は音声の周期性・声質を反映する指標であり各閉鎖音種間で有意差が確認されている。/p/ のエネルギーは急速に減衰するのに対し/k/ および/t/ は緩やかな減衰を示すため，エネルギー軌跡は両者の対立を弁別する補助手がかりとして機能する。

声調分類においてCPP が最上位の寄与を示した点は注目に値する。低入声調（Tone 3）は下降調であるのに対し高入声調（Tone 5）は平坦調に近く，声帯振動パターンおよびその時間的変化が異なる。CPP はこの声質差を感度よく捉える指標であり，F0 のみでは説明できない声調対立の側面を反映している。この知見はF0 が閩南語声調の十分な弁別手がかりであるという従来の仮定に再考を促すものであり，今後は電気声門図（EGG）を用いた声帯振動ジェスチャーの詳細な計測が有力な補完的手法となりうる。

### 4.4. 誤分類傾向の音声学的解釈

機械モデルにおける/t/ の高正答率および高偽陽性率は，MFCC による高F2 特徴の強調的抽出に起因すると考えられる。しかし英語・韓国語母語者を除く人間被験者はこの手がかりに対してそれほど高い感受性を示さず[3]，MFCCが人間の知覚に対応しない変動を過大評価している可能性を示す。

/p/ において機械が人間を大きく下回った要因として，/p/ のエネルギーの急速かつ短時間の減衰というスペクトル傾斜パターンがMFCC による抽出に不向きであることが挙げられる。人間がこの動的情報を柔軟に統合できる一方，静的なフレームベースの特徴量設計では対応が難しい。/k/ は人間・機械いずれにとっても識別が困難であった。音声産出において/k/ は非周期性や脱落を生じやすく，弁別手がかりとしての安定性が低下することが識別精度を抑制していると考えられる[3]。

### 4.5. 人間知覚との対応と閩南語のパラドック

ス知覚実験において韓国語・英語話者は/t/ に高い正答率を示したが，これは母語に語末閉鎖音が存在しF2 関連手がかりへの感受性が高いことによる[3]。一方，閩南語母語者は声調・韻尾いずれにおいても他群を下回るという予想外の結果を示した。これは，入声韻尾の弱化・声門化により音素レベルの音響情報が不明瞭化するため，母語話者が分節的手がかりよりも語彙的・文脈的手がかりに依存する知覚戦略を採用していることを反映すると考えられる[4, 3]。

この「閩南語のパラドックス」は，音素レベルの弁別精度と文レベルの音声理解が独立して機能するという仮説を支持する。自由変異が語レベルで許容される言語構造においては，聴者はより高次の文脈情報によって音韻的曖昧性を補完する戦略を採る可能性がある。

### 4.6. 自由変異・文脈情報と今後の展望

本研究の識別限界の一部は，自由変異，発音の不規則性，および単音節孤立語として文脈情報を排除した実験設計に起因する。語レベル・文レベルの文脈を加えた条件下での識別精度の変化を検証することは今後の重要な研究課題である。この知見は閩南語音声認識・合成システムの構築においても実践的意義を持ち[2]，音素レベルの分類精度の限界を明確化することで語彙・韻律モデルとの統合による認識精度向上に向けた設計指針が得られると考えられる。

参考文献[1] Amalesh Gope, Anusuya Pal, Sekholu Tet- seo, Tulika Gogoi, Dinkur Borah, et al.

Multi-class identiﬁcation of tonal contrasts in chokri using supervised machine learning algorithms. Humanities and Social Sciences Communications, 11(1):1–13, 2024.

[2] Un-Gian Iunn, Kiat-gak Lau, Sheng-an Li, and Cheng-yan Kao. A study on implemen- tation of southern-min taiwanese tone sandhi system. In Proceedings of the 19th Paciﬁc Asia Conference on Language, Information and Computation, pages 119–130, 2005.

[3] Jeremy Lim. Acoustic cues and cross- linguistic perception of checked tones in southern min. Manuscript, International Christian University, 2026.

[4] Ho-hsien Pan and Shao-ren Lyu. Taiwan min nan (taiwanese) checked tones sound change.

In Interspeech, pages 2641–2645, 2021.

[5] Jeremy Perkinsa, Yu Yanb, Seunghun J Dahm Leec, and IIT Universityd. Using ma- chine learning to model the three-way laryn- geal contrast in korean. In Proceedings of the

## 20. th International Congress of Phonetic Sci-

ences, pages 783–787, 2023.

[6] Hiroki Tanaka and Nick Campbell. Classiﬁ- cation of social laughter in natural conversa- tional speech. Computer Speech & Language, 28(1):314–325, 2014.

[7] Jiameng Yan, Lan Tian, Xiaoyu Wang, Jun- hui Liu, and Meng Li. A mandarin tone recognition algorithm based on random for- est and features fusion. In Proceedings of the 7th International Conference on Control Engineering and Artiﬁcial Intelligence, pages 168–172, 2023.

## Appendix

図1 Comparison of Accuracy and Macro-F1 across classiﬁers. For coda classiﬁcation, results are shown under Baseline and Full conditions. For tone classiﬁcation, overall performance across classiﬁers is presented.

図2 Confusion matrices for coda classiﬁcation under the Hierarchical Full Hybrid feature condition (acoustic + wav2vec2 features). Each panel shows the per-class prediction counts for four classiﬁers: Logistic Regression (Acc = 0.705, Macro-F1 = 0.708), SVM with RBF kernel (Acc = 0.642, Macro-F1 = 0.654), Random Forest (Acc = 0.537, Macro-F1 = 0.549), and MLP/BPNN (Acc = 0.779, Macro-F1 = 0.780). The MLP achieves the highest overall performance, with strong diagonal concentration across all four coda categories (glottal, /k/, /p/, /t/). Across all models, glottal and /t/ stops are classiﬁed most reliably, while /k/ and /p/ show greater confusion with each other̶ a pattern consistent with their similar acoustic release characteristics. Random Forest performs substantially below the other three models, suggesting limited generalization under this high-dimensional hybrid feature set.

図3 MLP learning curves for coda classiﬁcation. Training loss decreases rapidly and converges within approximately 50 epochs, while training accuracy approaches 100%. The gap between near-perfect training accuracy and lower test performance suggests limited generalization, likely reﬂecting acoustic overlap among oral codas.

図4 MLP learning curves for tone classiﬁcation. The model converges quickly, with training accuracy reaching nearly 100% and loss approaching zero. Compared to coda classiﬁcation, the faster stabilization reﬂects the dominance of pitch-related cues in tone discrimination.

図5 Results of the feature group ablation study. The left panel shows coda classiﬁcation and the right panel shows tone classiﬁcation. Bars indicate classiﬁcation accuracy after removing each feature group. The dashed line represents the baseline accuracy using all features.

図6 Random Forest Gini feature group importance for coda classiﬁcation. Bars indicate normalized importance values aggregated by feature group.

図7図7 Random Forest Gini feature group importance for tone classiﬁcation. Bars indicate normalized importance values aggregated by feature group.

図8 Error distribution, speaker-wise error counts, per-class correct/error breakdown, and normalized confusion matrix for the four-way coda classiﬁcation (/glottal/, /k/, /p/, /t/). The most frequent confusions occur among the oral stops, particularly /p/ →/t/ and /k/ →/p, t/, whereas /glottal/ shows the highest class-wise accuracy (0.92). Speaker-level variation is also observed, with S3 exhibiting the highest error count.

図9 Error distribution, speaker-wise error counts, per-class correct/error breakdown, and normalized confusion matrix for the binary tone classiﬁcation (High vs. Low). Errors are symmetrically distributed between High →Low and Low →High, with class-wise accuracies of 0.83 (High) and 0.88 (Low). Compared to coda classiﬁcation, tone classiﬁcation exhibits higher overall separability and lower speaker-dependent variability.

図10 Human vs. Machine Perception Comparison for Southern Min Coda and Tone Classiﬁ- cation. Top-left: Per-class accuracy for coda classiﬁcation, comparing human listeners and an MLP (BPNN) model across four coda types (glottal, /k/, /p/, /t/). The ML model outperforms humans on glottal (0.92 vs. 0.78) and /t/ (0.78 vs. 0.55), while humans show an advantage on /p/ (0.69 vs. 0.50); performance on /k/ is comparable (0.54 vs. 0.42). Top-right: Overall accuracy across coda and tone tasks; the ML model achieves higher accuracy in both domains (Coda: 0.68 vs. 0.60; Tone: 0.85 vs. 0.71). Bottom-left: Per-class accuracy for tone classiﬁcation (High vs. Low); the ML model consistently outperforms humans on both categories (High: 0.83 vs. 0.65; Low: 0.88 vs. 0.75). Bottom-right: Per-class accuracy diﬀerence (ML －Human); positive values (green) indicate ML advantage across most categories, with the notable exception of /p/ (－0.19), where human listeners outperform the model.

## Figures

![Figure 1](content/images/ml-southern-min-checked-tones-fig1.png)

![Figure 2](content/images/ml-southern-min-checked-tones-fig2.png)

![Figure 3](content/images/ml-southern-min-checked-tones-fig3.png)

![Figure 4](content/images/ml-southern-min-checked-tones-fig4.png)

![Figure 5](content/images/ml-southern-min-checked-tones-fig5.png)

![Figure 6](content/images/ml-southern-min-checked-tones-fig6.png)

![Figure 7](content/images/ml-southern-min-checked-tones-fig7.png)

![Figure 8](content/images/ml-southern-min-checked-tones-fig8.png)

![Figure 9](content/images/ml-southern-min-checked-tones-fig9.png)

![Figure 10](content/images/ml-southern-min-checked-tones-fig10.png)

