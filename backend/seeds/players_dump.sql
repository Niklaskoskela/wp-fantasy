--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player (
    id integer NOT NULL,
    name text,
    nationality character varying,
    points integer,
    p_points integer,
    points_1 integer DEFAULT 0 NOT NULL,
    points_2 integer DEFAULT 0 NOT NULL,
    points_3 integer DEFAULT 0 NOT NULL,
    points_4 integer DEFAULT 0 NOT NULL,
    points_5 integer DEFAULT 0 NOT NULL,
    points_6 integer DEFAULT 0 NOT NULL,
    points_7 integer DEFAULT 0 NOT NULL,
    points_8 integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.player OWNER TO postgres;

--
-- Name: player_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.player ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.player_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: player; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player (id, name, nationality, points, p_points, points_1, points_2, points_3, points_4, points_5, points_6, points_7, points_8) FROM stdin;
197	Franko Lazic	CRO	0	0	0	0	0	0	0	0	0	0
189	Toni Popadic	CRO	0	0	0	0	0	0	0	0	0	0
193	Luka Loncar	CRO	0	0	0	0	0	0	0	0	0	0
304	Bernat Sanahuja	SPA	0	0	0	0	0	0	0	0	0	0
300	Marc Larumbe	SPA	0	0	0	0	0	0	0	0	0	0
301	Eduardo Lorrio	SPA	0	0	0	0	0	0	0	0	0	0
266	Petar Jaksic	SRB	0	0	0	0	0	0	0	0	0	0
200	Marko Zuvela	CRO	0	0	0	0	0	0	0	0	0	0
275	Vuk Milojevic	SRB	0	0	0	0	0	0	0	0	0	0
272	Vasilije Martinovic	SRB	0	0	0	0	0	0	0	0	0	0
160	Joao Pedro Serra	BRA	0	0	0	0	0	0	0	0	0	0
175	Deming Li	CHN	0	0	0	0	0	0	0	0	0	0
176	Jiahao Peng	CHN	0	0	0	0	0	0	0	0	0	0
177	Yuhao Cai	CHN	0	0	0	0	0	0	0	0	0	0
182	Jiashao Zhu	CHN	0	0	0	0	0	0	0	0	0	0
183	Zijun Wen	CHN	0	0	0	0	0	0	0	0	0	0
185	Yongxiang Wu	CHN	0	0	0	0	0	0	0	0	0	0
186	Beiyi Wang	CHN	0	0	0	0	0	0	0	0	0	0
187	Zhilong Liu	CHN	0	0	0	0	0	0	0	0	0	0
174	Yu Liu	CHN	0	0	0	0	0	0	0	0	0	0
198	Tin Brubnjak	CRO	0	0	0	0	0	0	0	0	0	0
204	Laurence Barker	AUS	0	0	0	0	0	0	0	0	0	0
207	Drew McJannett	AUS	0	0	0	0	0	0	0	0	0	0
209	Sam Nangle	AUS	0	0	0	0	0	0	0	0	0	0
216	Tristan Glanznig	AUS	0	0	0	0	0	0	0	0	0	0
217	Andrej Grgurevic	AUS	0	0	0	0	0	0	0	0	0	0
211	Tim Putt	AUS	0	0	0	0	0	0	0	0	0	0
206	Nathan Power	AUS	0	0	0	0	0	0	0	0	0	0
213	Matthew Byrnes	AUS	0	0	0	0	0	0	0	0	0	0
205	Marcus Berehulak	AUS	0	0	0	0	0	0	0	0	0	0
184	Dingsong Shen	CHN	0	0	0	0	0	0	0	0	0	0
229	Konstaninos Genidounias	GRE	0	0	0	0	0	0	0	0	0	0
230	Aristides Chalyvopoulos	GRE	0	0	0	0	0	0	0	0	0	0
233	Csoma Kristof	HUN	0	0	0	0	0	0	0	0	0	0
234	Angyal Daniel	HUN	0	0	0	0	0	0	0	0	0	0
235	Manhercz Krisztian	HUN	0	0	0	0	0	0	0	0	0	0
236	Molnar Erik	HUN	0	0	0	0	0	0	0	0	0	0
237	Vamos Marton	HUN	0	0	0	0	0	0	0	0	0	0
238	Nagy Adam	HUN	0	0	0	0	0	0	0	0	0	0
228	Evangelos Pouros	GRE	0	0	0	0	0	0	0	0	0	0
239	Fekete Gergo	HUN	0	0	0	0	0	0	0	0	0	0
240	Burian Gergely	HUN	0	0	0	0	0	0	0	0	0	0
241	Kovacs Peter	HUN	0	0	0	0	0	0	0	0	0	0
199	Konstantin Kharkov	CRO	0	0	0	0	0	0	0	0	0	0
196	Loren Fatovic	CRO	0	0	0	0	0	0	0	0	0	0
298	Alvaro Granados	SPA	0	0	0	0	0	0	0	0	0	0
296	Sergi Cabanas	SPA	0	0	0	0	0	0	0	0	0	0
303	Felipe Perrone	SPA	0	0	0	0	0	0	0	0	0	0
302	Alberto Munarriz	SPA	0	0	0	0	0	0	0	0	0	0
226	Efstathios Kalogeropoulos	GRE	0	0	0	0	0	0	0	0	0	0
313	Dusan Banicevic	MNE	0	0	0	0	0	0	0	0	0	0
330	Ryder Dodd	USA	0	0	0	0	0	0	0	0	0	0
329	Hannes Daube	USA	0	0	0	0	0	0	0	0	0	0
308	Lazar Andric	MNE	0	0	0	0	0	0	0	0	0	0
311	Dimitrije Obradovic	MNE	0	0	0	0	0	0	0	0	0	0
299	Miguel De Toro	SPA	0	0	0	0	0	0	0	0	0	0
317	Dmitrii Kholod	MNE	0	0	0	0	0	0	0	0	0	0
323	Bernardo Herzer	USA	0	0	0	0	0	0	0	0	0	0
324	Jack Larsen	USA	0	0	0	0	0	0	0	0	0	0
325	Dominic Brown	USA	0	0	0	0	0	0	0	0	0	0
328	Jacob Ehrhardt	USA	0	0	0	0	0	0	0	0	0	0
276	Boris Vapenski	SRB	0	0	0	0	0	0	0	0	0	0
232	Nikolaos Gkillas	GRE	0	0	0	0	0	0	0	0	0	0
259	Luca Damonte	ITA	0	0	0	0	0	0	0	0	0	0
256	Giacomo Cannella	ITA	0	0	0	0	0	0	0	0	0	0
295	Jose Javier Bustos	SPA	0	0	0	0	0	0	0	0	0	0
264	Lazar Dobozanov	SRB	0	0	0	0	0	0	0	0	0	0
164	Logan Cabral	BRA	0	0	0	0	0	0	0	0	0	0
169	Lucas de Oliveira	BRA	0	0	0	0	0	0	0	0	0	0
165	Luis Ricardo Silva	BRA	0	0	0	0	0	0	0	0	0	0
167	Gustavo Guimaraes	BRA	0	0	0	0	0	0	0	0	0	0
161	Joao Gabriel Silveira	BRA	0	0	0	0	0	0	0	0	0	0
162	Andre Luiz de Freitas	BRA	0	0	0	0	0	0	0	0	0	0
163	Gabriel Sojo da Silva	BRA	0	0	0	0	0	0	0	0	0	0
166	Marcos Pedroso	BRA	0	0	0	0	0	0	0	0	0	0
168	Gustavo Coutinho	BRA	0	0	0	0	0	0	0	0	0	0
191	Rino Buric	CRO	0	0	0	0	0	0	0	0	0	0
293	Unai Biel	SPA	0	0	0	0	0	0	0	0	0	0
292	Unai Aguirre	SPA	0	0	0	0	0	0	0	0	0	0
294	Alejandro Bustos	SPA	0	0	0	0	0	0	0	0	0	0
192	Filip Krzic	CRO	0	0	0	0	0	0	0	0	0	0
208	Angus Lambie	AUS	0	0	0	0	0	0	0	0	0	0
180	Rui Chen	CHN	0	0	0	0	0	0	0	0	0	0
214	Jacob Mercep	AUS	0	0	0	0	0	0	0	0	0	0
210	Milos Maksimovic	AUS	0	0	0	0	0	0	0	0	0	0
212	Charlie Negus	AUS	0	0	0	0	0	0	0	0	0	0
195	Luka Bukic	CRO	0	0	0	0	0	0	0	0	0	0
190	Matias Biljaka	CRO	0	0	0	0	0	0	0	0	0	0
203	Nic Porter	AUS	0	0	0	0	0	0	0	0	0	0
215	Luke Pavillard	AUS	0	0	0	0	0	0	0	0	0	0
220	Dimitrios Skoumpakis	GRE	0	0	0	0	0	0	0	0	0	0
227	Konstantinos Gkiouvetsis	GRE	0	0	0	0	0	0	0	0	0	0
225	Stylianos Argyropoulos	GRE	0	0	0	0	0	0	0	0	0	0
223	Konstantinos Kakaris	GRE	0	0	0	0	0	0	0	0	0	0
224	Dimitrios Nikolaidis	GRE	0	0	0	0	0	0	0	0	0	0
181	Yimin Chen	CHN	0	0	0	0	0	0	0	0	0	0
218	Panagiotis Tzortzatos	GRE	0	0	0	0	0	0	0	0	0	0
172	Pedro Real	BRA	0	0	0	0	0	0	0	0	0	0
173	Honghui Wu	CHN	0	0	0	0	0	0	0	0	0	0
178	Zekai Xie	CHN	0	0	0	0	0	0	0	0	0	0
179	Zhongxian Chen	CHN	0	0	0	0	0	0	0	0	0	0
221	Nikolaos Papanikolaou	GRE	0	0	0	0	0	0	0	0	0	0
219	Emmanouil Andreadis	GRE	0	0	0	0	0	0	0	0	0	0
231	Nikolaos Gardikas	GRE	0	0	0	0	0	0	0	0	0	0
188	Marko Bijac	CRO	0	0	0	0	0	0	0	0	0	0
194	Josip Vrlic	CRO	0	0	0	0	0	0	0	0	0	0
202	Zvonimir Butic	CRO	0	0	0	0	0	0	0	0	0	0
201	Ante Vukicevic	CRO	0	0	0	0	0	0	0	0	0	0
249	Tommaso Baggi Necchi	ITA	0	0	0	0	0	0	0	0	0	0
252	Mario Del Basso	ITA	0	0	0	0	0	0	0	0	0	0
258	Francesco Cassia	ITA	0	0	0	0	0	0	0	0	0	0
260	Filippo Ferrero	ITA	0	0	0	0	0	0	0	0	0	0
269	Nikola Murisic	SRB	0	0	0	0	0	0	0	0	0	0
278	Calvin Kuperis	RSA	0	0	0	0	0	0	0	0	0	0
279	Carl Germishuys	RSA	0	0	0	0	0	0	0	0	0	0
280	Brett Sneddon	RSA	0	0	0	0	0	0	0	0	0	0
281	Dylan Watt	RSA	0	0	0	0	0	0	0	0	0	0
282	Dean Sneddon	RSA	0	0	0	0	0	0	0	0	0	0
283	Kelly Geldenhuys	RSA	0	0	0	0	0	0	0	0	0	0
284	Luka Rajak	RSA	0	0	0	0	0	0	0	0	0	0
285	Manqoba Bungane	RSA	0	0	0	0	0	0	0	0	0	0
286	Matthew Bowers	RSA	0	0	0	0	0	0	0	0	0	0
288	Ryan Sneddon	RSA	0	0	0	0	0	0	0	0	0	0
289	Tristan Grimett	RSA	0	0	0	0	0	0	0	0	0	0
290	Themba Mthembu	RSA	0	0	0	0	0	0	0	0	0	0
291	Nathan Ward	RSA	0	0	0	0	0	0	0	0	0	0
251	Alessandro Velotto	ITA	0	0	0	0	0	0	0	0	0	0
253	Tommaso Gianazza	ITA	0	0	0	0	0	0	0	0	0	0
257	Francesco Condemi	ITA	0	0	0	0	0	0	0	0	0	0
331	Connor Ohl	USA	0	0	0	0	0	0	0	0	0	0
336	Chase Dodd	USA	0	0	0	0	0	0	0	0	0	0
337	PLayer1	ROU	0	0	0	0	0	0	0	0	0	0
338	PLayer2	JPN	0	0	0	0	0	0	0	0	0	0
339	PLayer3	SGP	0	0	0	0	0	0	0	0	0	0
340	PLayer4	CAN	0	0	0	0	0	0	0	0	0	0
248	Gianmarco Nicosia	ITA	0	0	0	0	0	0	0	0	0	0
250	Nicholas Presciutti	ITA	0	0	0	0	0	0	0	0	0	0
274	Dusan Mandic	SRB	0	0	0	0	0	0	0	0	0	0
255	Francesco Di Fulvio	ITA	0	0	0	0	0	0	0	0	0	0
254	Lorenzo Bruni	ITA	0	0	0	0	0	0	0	0	0	0
262	Edoardo Di Somma	ITA	0	0	0	0	0	0	0	0	0	0
261	Matteo Iocchi Gratta	ITA	0	0	0	0	0	0	0	0	0	0
287	Matthew Neser	RSA	0	0	0	0	0	0	0	0	0	0
306	Fran Valera	SPA	0	0	0	0	0	0	0	0	0	0
270	Strahinja Rasovic	SRB	0	0	0	0	0	0	0	0	0	0
265	Sava Randjelovic	SRB	0	0	0	0	0	0	0	0	0	0
273	Milos Cuk	SRB	0	0	0	0	0	0	0	0	0	0
268	Nemanja Vico	SRB	0	0	0	0	0	0	0	0	0	0
263	Radoslav Filipovic	SRB	0	0	0	0	0	0	0	0	0	0
277	Viktor Rasovic	SRB	0	0	0	0	0	0	0	0	0	0
271	Nikola Jaksic	SRB	0	0	0	0	0	0	0	0	0	0
170	Joao Pedro Leime	BRA	0	0	0	0	0	0	0	0	0	0
171	Lucas Farias	BRA	0	0	0	0	0	0	0	0	0	0
315	Dusan Matkovic	MNE	0	0	0	0	0	0	0	0	0	0
312	Miroslav Perkovic	MNE	0	0	0	0	0	0	0	0	0	0
242	Vigvari Vendel	HUN	0	0	0	0	0	0	0	0	0	0
243	Jansik Szilard	HUN	0	0	0	0	0	0	0	0	0	0
244	Vigvari Vince	HUN	0	0	0	0	0	0	0	0	0	0
245	Mizsei Marton	HUN	0	0	0	0	0	0	0	0	0	0
246	Vismeg Zsombor	HUN	0	0	0	0	0	0	0	0	0	0
247	Nagy Akos	HUN	0	0	0	0	0	0	0	0	0	0
307	Petar Tesanovic	MNE	0	0	0	0	0	0	0	0	0	0
327	Dylan Woodhead	USA	0	0	0	0	0	0	0	0	0	0
335	Marko Vavic	USA	0	0	0	0	0	0	0	0	0	0
322	Adrian Weinberg	USA	0	0	0	0	0	0	0	0	0	0
333	Max Irving	USA	0	0	0	0	0	0	0	0	0	0
318	Vasilije Radovic	MNE	0	0	0	0	0	0	0	0	0	0
297	Biel Gomila	SPA	0	0	0	0	0	0	0	0	0	0
319	Djuro Radovic	MNE	0	0	0	0	0	0	0	0	0	0
309	Aljosa Macic	MNE	0	0	0	0	0	0	0	0	0	0
310	Jovan Vujovic	MNE	0	0	0	0	0	0	0	0	0	0
267	Djordje Lazic	SRB	0	0	0	0	0	0	0	0	0	0
326	Ben Liechty	USA	0	0	0	0	0	0	0	0	0	0
332	Nicolas Saveljic	USA	0	0	0	0	0	0	0	0	0	0
334	Ryan Ohl	USA	0	0	0	0	0	0	0	0	0	0
316	Strahinja Gojkovic	MNE	0	0	0	0	0	0	0	0	0	0
320	Balsa Vuckovic	MNE	0	0	0	0	0	0	0	0	0	0
321	Filip Gardasevic	MNE	0	0	0	0	0	0	0	0	0	0
314	Savo Cetkovic	MNE	0	0	0	0	0	0	0	0	0	0
305	Roger Tahull	SPA	0	0	0	0	0	0	0	0	0	0
222	Ioannis Alafragkis	GRE	0	0	0	0	0	0	0	0	0	0
\.


--
-- Name: player_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.player_id_seq', 340, true);


--
-- Name: player player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

