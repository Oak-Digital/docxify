{ pkgs, config, ... }:

let
  bun = config.languages.javascript.bun.package;
  bunBin = "${bun}/bin/bun";
in
{
  languages.javascript = {
    enable = true;
    bun = {
      enable = true;
    };
  };

  git-hooks.hooks = {
    format = {
      enable = true;
      name = "biome format and lint";
      entry = "sh -c \"${bunBin} run format:fix && ${bunBin} run lint:fix\"";
      pass_filenames = false;
    };
  };
}
