<script lang="ts">
    let { children } = $props();
</script>

<nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/settings">Settings</a>
</nav>

{@render children()}

<style>
    nav {
        display: flex;
        gap: 1rem;
    }
</style>
