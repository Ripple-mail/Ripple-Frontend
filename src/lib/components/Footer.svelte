<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer>
	<div class="container">
		<div class="top">
			<div class="description">
				<h2>Ripple Mail</h2>
				<p>Communication that makes waves.</p>
			</div>
			<div class="links">
				<h3>Links</h3>
				<ul class="social">
					<li>
						<a href="https://github.com/Ripple-mail" target="_blank" rel="noopener noreferrer">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path>
							</svg>
							Github
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<div class="copyright">
		<p>&copy; {currentYear} Ripple-Mail. All rights reserved.</p>
		<p>
			Code and website by
			<a href="https://ultraslayyy.xyz" target="_blank" rel="noopener noreferrer">Ultraslay</a>
			and
			<a href="https://heggo.dev" target="_blank" rel="noopener noreferrer">Heggo</a>
		</p>
	</div>
</footer>

<style>
	footer {
		background-color: var(--surface-color);
		border-top: 1px solid var(--border-color);
		padding: 2rem 0 1rem;
	}

	.container {
		width: 100%;
		max-width: 1200px;
		height: 20%;
		max-height: 20%;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.top {
		display: flex;
		justify-content: space-between;
		margin-bottom: 3rem;
	}

	.description h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
	}

	.description p {
		color: var(--text-secondary-color);
		margin: 0;
	}

	.links {
		display: flex;
		gap: 3rem;
	}

	.links h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem;
		color: var(--text-primary-color);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	ul li {
		margin-bottom: 0.75rem;
	}

	ul a {
		color: var(--text-secondary-color);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	ul a:hover {
		color: var(--primary-color);
	}

	.social li a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.copyright {
		padding-top: 2rem;
		border-top: 1px solid var(--border-color);
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
		text-align: center;
	}

	.copyright p {
		color: var(--text-secondary-color);
		font-size: 0.875rem;
		margin: 0;
	}

	@media (max-width: 768px) {
		.top {
			flex-direction: column;
			gap: 2rem;
		}

		.copyright {
			flex-direction: column;
			gap: 0.5rem;
			align-items: center;
		}
	}

	@media (max-width: 576px) {
		.links {
			flex-direction: column;
			gap: 2rem;
		}
	}
</style>
