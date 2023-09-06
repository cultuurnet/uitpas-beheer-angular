namespace 'uitpas-balie-frontend' do
  desc "Build binaries"
  task :build do |task|

    require 'json'

    calver_version     = ENV['PIPELINE_VERSION'].nil? ? Time.now.strftime("%Y.%m.%d.%H%M%S") : ENV['PIPELINE_VERSION']
    configuration_hash = { 'basePath' => '/app_v1/', 'buildNumber' => calver_version }

    system('npm install') or exit 1

    system('node_modules/bower/bin/bower install') or exit 1

    system('angular_config hash -c config.dist.json > config.json')
    config = JSON.load File.new('config.json')
    File.open('config.json', 'w') { |file| file.write(config.merge!(configuration_hash).to_json) }

    system('node_modules/grunt-cli/bin/grunt build') or exit 1
  end
end
