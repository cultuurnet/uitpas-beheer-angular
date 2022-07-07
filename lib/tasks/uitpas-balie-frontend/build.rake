namespace 'uitpas-balie-frontend' do
  desc "Build binaries"
  task :build do |task|

    require 'json'

    calver_version     = ENV['PIPELINE_VERSION'].nil? ? Time.now.strftime("%Y.%m.%d.%H%M%S") : ENV['PIPELINE_VERSION']
    configuration_hash = { 'basePath' => '/app/', 'buildNumber' => calver_version }

    puts "=== DEBUG: start npm install ==="
    system('npm install') or exit 1

    puts "=== DEBUG: start bower install ==="
    system('bower install') or exit 1

    puts "=== DEBUG: start angular_config ==="
    system('angular_config hash -c config.dist.json > config.json')
    config = JSON.load File.new('config.json')
    File.open('config.json', 'w') { |file| file.write(config.merge!(configuration_hash).to_json) }

    puts "=== DEBUG: start grunt build ==="
    system('grunt build') or exit 1
  end
end
