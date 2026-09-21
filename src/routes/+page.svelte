<script lang="ts">
	import { base } from '$app/paths';
	import { settings } from '$lib/content';
	import Seo from '$lib/components/Seo.svelte';
	import PostCard from '$lib/components/PostCard.svelte';
	import Newsletter from '$lib/components/Newsletter.svelte';
	import HajjWorld from '$lib/components/HajjWorld.svelte';
	import TrackCard from '$lib/components/TrackCard.svelte';
	import HajjTopicIcon from '$lib/components/HajjTopicIcon.svelte';
	let { data } = $props();
	const posts = $derived([...data.featured, ...data.recent]);
</script>

<Seo markdownAlt />

<section class="hajj-home-hero">
	<div class="hajj-brand"><span>Arriqaaq</span><small>PLAYFUL PATHS TO SERIOUS LEARNING</small></div>
	<div class="hajj-scene"><HajjWorld /></div>
	<div class="hajj-hero-ticket">
		<div><span class="hajj-label">WELCOME, SEEKER</span><h1>A bright place to learn, make and wonder.</h1></div>
		<p>{settings.description}</p>
		<a class="hajj-action" href="#journeys">Choose a journey <span>→</span></a>
	</div>
</section>

<section class="hajj-marquee" aria-label="What you can explore"><div>FIQH ✦ QUR'AN ✦ HADITH ✦ ARABIC ✦ CRAFTS ✦ TECHNOLOGY ✦ REFLECTIONS ✦</div></section>

<section class="hajj-intro">
	<div class="hajj-number">01</div><div><span class="hajj-label">THE LIBRARY</span><h2>Knowledge is a journey.<br />Take it one stop at a time.</h2></div>
	<p>Follow ordered learning paths, wander through illustrated ideas, or pick up the newest piece from the journal.</p>
</section>

<section class="hajj-journeys" id="journeys">
	<header class="hajj-section-head hajj-section-head--sky"><div><span class="hajj-label">GUIDED ROUTES</span><h2>Begin with a map</h2><p>Long-form subjects, arranged as a route rather than a pile.</p></div><span class="hajj-stamp">STUDY<br />AT YOUR<br />OWN PACE</span></header>
	<div class="track-grid">{#each data.tracks as track}<TrackCard {track} />{/each}<a class="hajj-side-quest" href={`${base}/courses/`}><span>＋</span><strong>Side quests</strong><p>Short courses, workshops and practical projects.</p><em>Explore →</em></a></div>
</section>

<section class="hajj-topics">
	<header class="hajj-section-head hajj-section-head--orange"><div><span class="hajj-label">PICK A LANDMARK</span><h2>Explore the library</h2><p>Each landmark opens a different corner of the collection.</p></div></header>
	<div class="hajj-topic-map"><div class="hajj-topic-route" aria-hidden="true"></div><div class="hajj-topic-grid">{#each data.tags.slice(0, 8) as tag, i}<a href={`${base}/tag/${tag.slug}/`}><HajjTopicIcon name={tag.name} index={i} /><span class="hajj-topic-copy"><strong>{tag.name}</strong><small>{tag.post_count} pieces · visit →</small></span></a>{/each}</div></div>
</section>

<section class="hajj-latest" id="latest">
	<header class="hajj-section-head hajj-section-head--green"><div><span class="hajj-label">NEW ARRIVALS</span><h2>From the journal</h2><p>Fresh notes, releases and field reports from Arriqaaq.</p></div><a href={`${base}/page/2/`}>Open the archive →</a></header>
	<div class="hajj-post-feed">{#each posts.slice(0, 7) as post, i}<div class:featured={i===0}><span class="hajj-post-index">{String(i+1).padStart(2,'0')}</span><PostCard {post} /></div>{/each}</div>
</section>

<section class="hajj-newsletter"><div><span class="hajj-label">POSTCARD FROM ARRIQAAQ</span><h2>New lessons for your next stop.</h2></div><Newsletter /></section>
